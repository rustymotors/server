package main

import (
	"fmt"
	internal "github.com/rustymotors/server/internal"
	"net"
	"net/http"
)

type ServerInstance struct {
	httpPorts []int
	tcpPorts  []int
	servers   []net.Listener
}

func ListenLoop(ln net.Listener) error {
	for {
		conn, err := ln.Accept()
		internal.CheckError(err)
		go HandleConnection(conn)
	}
}

func HandleConnection(c net.Conn) {
	fmt.Println("We got a connection!")
	
	c.Write([]byte("Cya!"))

}

func NewServerInstance(httpPorts []int, tcpPorts []int) (instance *ServerInstance, err error) {
	return &ServerInstance{
		httpPorts: httpPorts,
		tcpPorts:  tcpPorts,
	}, nil
}

func (s *ServerInstance) Start() error {
	for i := range s.httpPorts {

		port := fmt.Sprintf(":%d", s.httpPorts[i])

		fmt.Printf("Starting http server on %s\n", port)

		go func(port string) {
			http.Handle("/ShardList/", http.HandlerFunc(internal.ShardList))
			http.Handle("/", http.HandlerFunc(internal.AuthLogin))

			err := http.ListenAndServe(port, nil)
			internal.CheckError(err)

		}(port)
	}

	for i := range s.tcpPorts {

		port := fmt.Sprintf(":%d", s.tcpPorts[i])

		fmt.Printf("Starting tcp server on %s\n", port)

		ln, err := net.Listen("tcp", port)
		internal.CheckError(err)
		go ListenLoop(ln)

	}

	return nil

}

func main() {
	httpPorts := []int{3000}
	tcpPorts :=  []int{}   // []int{8226, 8228}

	fmt.Println("Everythis starting")

	instance, err := NewServerInstance(httpPorts, tcpPorts)
	internal.CheckError(err)

	err = instance.Start()
	internal.CheckError(err)
	
	defer fmt.Println("Everything stopping")

	for {

	}

}
