import { useState, useEffect, useRef } from "react";
import { Box, Input, Button, VStack, Text, HStack } from "@chakra-ui/react";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatProps {
  roomId: string;
  socket: any;
  userId: string;
}

const Chat = ({ roomId, socket, userId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on("chat-message", (data: any) => {
      const message: Message = {
        id: Date.now().toString(),
        sender: data.sender,
        content: data.content,
        timestamp: new Date(data.timestamp),
        isOwn: data.sender === socket.id
      };
      
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      content: newMessage,
      sender: socket.id,
      roomId: roomId,
      timestamp: Date.now()
    };

    socket.emit("chat-message", messageData);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box 
      height="400px" 
      border="1px solid" 
      borderColor="gray.200" 
      borderRadius="md"
      display="flex"
      flexDirection="column"
    >
      <Box 
        bg="blue.500" 
        color="white" 
        p={3} 
        borderTopRadius="md"
      >
        <Text fontWeight="bold">Chat</Text>
      </Box>
      
      <Box 
        flex="1" 
        p={3} 
        overflowY="auto" 
        bg="gray.50"
        maxHeight="300px"
      >
        <VStack align="stretch" spacing={3}>
          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.isOwn ? "flex-end" : "flex-start"}
              maxWidth="70%"
            >
              <Box
                bg={message.isOwn ? "blue.500" : "white"}
                color={message.isOwn ? "white" : "black"}
                p={2}
                borderRadius="md"
                boxShadow="sm"
              >
                <Text fontSize="sm">{message.content}</Text>
                <Text 
                  fontSize="xs" 
                  opacity={0.7}
                  textAlign={message.isOwn ? "right" : "left"}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Text>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      
      <HStack p={3} borderTop="1px solid" borderColor="gray.200">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          size="sm"
        />
        <Button 
          onClick={sendMessage} 
          colorScheme="blue" 
          size="sm"
          isDisabled={!newMessage.trim()}
        >
          Send
        </Button>
      </HStack>
    </Box>
  );
};

export default Chat;