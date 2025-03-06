"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Form, Input, Button, App } from "antd";  // App import edildi!

interface RegisterFormValues {
    name: string;
    username: string;
    password: string;
}

const RegisterPage = () => {
    const router = useRouter();
    const apiService = useApi();
    const { set: setToken } = useLocalStorage<string>("token", "");
    const [form] = Form.useForm();

    // Statik olmayan, context-aware message
    const { message } = App.useApp();

    const handleRegister = async (values: RegisterFormValues) => {
        try {
            const response = await apiService.post<{ token: string }>("/users", values);

            if (response.token) {
                setToken(response.token);
                message.success("Registration successful! Redirecting to users overview...");
                router.push("/users");
            } else {
                message.error("Registration successful but no token received.");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes("409") || error.message.includes("400")) {
                    message.error("Username already taken. Please choose a different username.");
                } else {
                    message.error("An error occurred during registration. Please try again.");
                }
            } else {
                message.error("An unexpected error occurred.");
            }
            router.push("/register");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h2>Register</h2>
            <Form
                form={form}
                onFinish={handleRegister}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please enter your name" }]}
                >
                    <Input placeholder="Enter your name" />
                </Form.Item>

                <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                        { required: true, message: "Please enter your username" },
                        { min: 1, message: "Username cannot be empty" }
                    ]}
                >
                    <Input placeholder="Enter your username" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        { required: true, message: "Please enter your password" },
                        { min: 1, message: "Password cannot be empty" }
                    ]}
                >
                    <Input.Password placeholder="Enter your password" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">Register</Button>
                </Form.Item>
            </Form>

            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    );
};

export default RegisterPage;