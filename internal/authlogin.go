package internal

import (
	"fmt"
	"net/http"
)

type AuthLoginSuccess struct {
	ticket string
}

func (a *AuthLoginSuccess) String() string {
	return fmt.Sprintf("Valid=TRUE\nTicket=%s", a.ticket)
}

type AuthLoginFailure struct {
	reasonCode string
	reasonText string
	reasonUrl  string
}

type AuthTicket struct {
	customerId string
	ticket string
}

type AuthTickets struct {
	tickets []AuthTicket
}

func (at *AuthTickets) AddTicket(customerId, ticket string) {
	at.tickets = append(at.tickets, AuthTicket{customerId: customerId, ticket: ticket})
}
func (at *AuthTickets) GetTicket(customerId string) (string, bool) {
	for _, t := range at.tickets {
		if t.customerId == customerId {
			return t.ticket, true
		}
	}
	return "", false
}
func (at *AuthTickets) RemoveTicket(customerId string) {
	for i, t := range at.tickets {
		if t.customerId == customerId {
			at.tickets = append(at.tickets[:i], at.tickets[i+1:]...)
			return
		}
	}
}

func (a *AuthLoginFailure) String() string {
	return fmt.Sprintf("reasoncode=%s\nreasontext=%s\nreasonurl=%s", a.reasonCode, a.reasonText, a.reasonUrl)
}
 
func (at *AuthTickets) generateTicket(customerId string) (string, bool) {
	ticket := "d316cd2dd6bf870893dfbaaf17f965884e"
	at.AddTicket(customerId, ticket)
	return ticket, true
}

	


func CheckUsernamePassword(username, password string) (bool, string) {
	if username == "admin" && password == "admin" {
		return true, "1234567890"
	}
	return false, ""
}

func maskPassword(password string) string {
	if len(password) > 0 {
		return password[:1] + "****"
	}
	return password
}

func AuthLogin(w http.ResponseWriter, req *http.Request) {

	fmt.Println("AuthLogin request from: ", req.RemoteAddr)

	authTickets := &AuthTickets{}

	err := req.ParseForm()
	CheckError(err)

	w.Header().Set("Content-Type", "text/plain")
	
	username := req.FormValue("username")
	password := req.FormValue("password")
	if username == "" || password == "" {
		w.Write([]byte((&AuthLoginFailure{
			reasonCode: "MISSING_CREDENTIALS",
			reasonText: "Username or password is missing",
			reasonUrl:  "https://example.com/help",
		}).String()))
		return
	}

	exists, customerId := CheckUsernamePassword(username, password)
	if !exists {
		w.Write([]byte((&AuthLoginFailure{
			reasonCode: "INVALID_CREDENTIALS",
			reasonText: "Invalid username or password",
			reasonUrl:  "https://example.com/help",
		}).String()))
		return
	}
	fmt.Printf("Received login request for user: %s, password: %s\n", username, maskPassword(password))
	fmt.Printf("Customer ID: %s\n", customerId)
	ticket, exists := authTickets.generateTicket(customerId)
	if !exists {
		w.Write([]byte((&AuthLoginFailure{
			reasonCode: "TICKET_GENERATION_FAILED",
			reasonText: "Failed to generate ticket",
			reasonUrl:  "https://example.com/help",
		}).String()))
		return
	}
	fmt.Printf("Generated ticket: %s\n", ticket)
	response := (&AuthLoginSuccess{
		ticket: ticket,
	}).String()
	fmt.Printf("Sending response: %s\n", response)
	// Send the response
	w.Write([]byte(response))
	fmt.Println("AuthLogin response sent")
}
