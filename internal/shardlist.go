package internal

import (
	"fmt"
	"net/http"
)

type ShardEntry struct {
	name                 string
	description          string
	id                   int
	loginServerIp        string
	loginServerPort      int
	lobbyServerIp        string
	lobbyServerPort      int
	mcotsServerIp        string
	statusId             int
	statusReason         string
	serverGroupName      string
	population           int
	maxPersonasPerUser   int
	diagnosticServerHost string
	diagnosticServerPort int
}

func NewShardEntry(name string, description string, id int, loginServerIp string, loginServerPort int, lobbyServerIp string, lobbyServerPort int, mcotsServerIp string, statusId int, statusReason string, serverGroupName string, population int, maxPersonasPerUser int, diagnosticServerHost string, diagnosticServerPort int) *ShardEntry {
	return &ShardEntry{
		name:                 name,
		description:          description,
		id:                   id,
		loginServerIp:        loginServerIp,
		loginServerPort:      loginServerPort,
		lobbyServerIp:        lobbyServerIp,
		lobbyServerPort:      lobbyServerPort,
		mcotsServerIp:        mcotsServerIp,
		statusId:             statusId,
		statusReason:         statusReason,
		serverGroupName:      serverGroupName,
		population:           population,
		maxPersonasPerUser:   maxPersonasPerUser,
		diagnosticServerHost: diagnosticServerHost,
		diagnosticServerPort: diagnosticServerPort,
	}
}

func (s *ShardEntry) FormatForShardList() string {
	return fmt.Sprintf(
		`[%s]
 Description=%s
 ShardId=%d
 LoginServerIP=%s
 LoginServerPort=%d
 LobbyServerIP=%s
 LobbyServerPort=%d
 MCOTSServerIP=%s
 StatusId=%d
 Status_Reason=%s
 ServerGroup_Name=%s
 Population=%d
 MaxPersonasPerUser=%d
 DiagnosticServerHost=%s
 DiagnosticServerPort=%d`,
		s.name,
		s.description,
		s.id,
		s.loginServerIp,
		s.loginServerPort,
		s.lobbyServerIp,
		s.lobbyServerPort,
		s.mcotsServerIp,
		s.statusId,
		s.statusReason,
		s.serverGroupName,
		s.population,
		s.maxPersonasPerUser,
		s.diagnosticServerHost,
		s.diagnosticServerPort,
	)
}

type SharServer struct {
	shards []*ShardEntry
}

func (s *SharServer) AddShard(shard *ShardEntry) {
	s.shards = append(s.shards, shard)
}
func (s *SharServer) GetShards() []*ShardEntry {
	return s.shards
}

func NewShardServer() *SharServer {
	return &SharServer{
		shards: make([]*ShardEntry, 0),
	}
}

func ShardList(w http.ResponseWriter, req *http.Request) {
	shardHost := "rusty-motors.com"

	shardServer := NewShardServer()

	firstShard := NewShardEntry(
		"Test",
		"Test",
		44,
		shardHost,
		8226,
		shardHost,
		7003,
		shardHost,
		0,
		"",
		"Group-1",
		88,
		2,
		shardHost,
		80)
	shardServer.AddShard(firstShard)

	w.Header().Set("Content-Type", "text/plain")
	shards := shardServer.GetShards()
	if len(shards) == 0 {
		http.Error(w, "No shards available", http.StatusNotFound)
		return
	}

	for _, shard := range shards {
		shardInfo := shard.FormatForShardList()
		w.Write([]byte(shardInfo))
		w.Write([]byte("\n"))
	}
}
