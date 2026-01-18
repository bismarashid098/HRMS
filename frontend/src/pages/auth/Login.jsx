import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // 🔹 TEMPORARY LOGIN (Accounts)
    // Backend later connect hoga
    login("dummy-token-accounts", "accounts");
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.100"
    >
      <Box bg="white" p="8" rounded="md" shadow="md" w="350px">
        <VStack spacing="4">
          <Heading size="md">Accounts Login</Heading>

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            colorScheme="blue"
            width="full"
            onClick={handleLogin}
          >
            Login
          </Button>

          <Text fontSize="sm" color="gray.500">
            Accounts access only
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;
