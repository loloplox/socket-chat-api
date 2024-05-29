import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { OnModuleInit } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnModuleInit {
    @WebSocketServer()
    public server: Server

    constructor(private readonly chatService: ChatService) {}

    onModuleInit() {
        this.server.on('connection', (socket) => {
            const { user } = socket.handshake.auth

            if (!user) {
                socket.disconnect()
                return
            }

            this.chatService.addClient({ id: socket.id, username: user })

            this.server.emit(
                'on-clients-connected',
                this.chatService.getClients(),
            )

            socket.on('disconnect', () => {
                this.chatService.removeClient(socket.id)
                this.server.emit(
                    'on-clients-connected',
                    this.chatService.getClients(),
                )
            })
        })
    }

    @SubscribeMessage('send-message')
    handleMessage(
        @MessageBody() message: string,
        @ConnectedSocket() client: Socket,
    ) {
        const { user } = client.handshake.auth

        console.log(message)
        if (!message) {
            return
        }

        this.server.emit('on-message-received', {
            user,
            message,
        })
    }
}
