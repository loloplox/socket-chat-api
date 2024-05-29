import { Injectable } from '@nestjs/common'

interface Client {
    id: string
    username: string
}

@Injectable()
export class ChatService {
    private clients: Record<string, Client> = {}

    public addClient(client: Client) {
        this.clients[client.id] = client
    }

    public removeClient(id: string) {
        delete this.clients[id]
    }

    public getClients() {
        return Object.values(this.clients)
    }
}
