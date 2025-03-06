"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";  // router kaldırıldı
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Card, DatePicker, Button, Input, App } from "antd";
import dayjs from "dayjs";
import useLocalStorage from "@/hooks/useLocalStorage";  // Yeni eklendi

const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const apiService = useApi();
    const { message } = App.useApp();

    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState<string>("");
    const [birthDate, setBirthDate] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const { get: getStoredUsername } = useLocalStorage<string>("username", ""); 
    const loggedInUsername = getStoredUsername();  // Mevcut oturum açan kullanıcının username'i

    const fetchUser = useCallback(async () => {
        if (!id) return;

        try {
            const fetchedUser = await apiService.get<User>(`/users/${id}`);
            setUser(fetchedUser);
            setUsername(fetchedUser.username ?? "");
            setBirthDate(fetchedUser.birthDate || null);
        } catch {
            message.error("Failed to load user data.");
        }
    }, [id, apiService, message]);

    useEffect(() => {
        if (id) {
            fetchUser();
            const interval = setInterval(() => {
                fetchUser();
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [fetchUser, id]);

    const handleSaveChanges = async () => {
        try {
            // noResponse parametresi true olarak gönderildi
            await apiService.put(`/users/${id}`, { username, birthDate }, true);
            message.success("Profile updated successfully!");
            setIsEditing(false);
            fetchUser();
        } catch {
            message.error("Failed to update profile.");
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <Card title={`User Profile - ${user.username}`} style={{ maxWidth: 500, margin: "20px auto" }}>
            <p><strong>Username:</strong></p>
            {isEditing ? (
                <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            ) : (
                <p>{user.username}</p>
            )}

            <p><strong>Status:</strong> {user.status}</p>
            <p><strong>Creation Date:</strong> {user.creationDate}</p>

            <p><strong>Birth Date:</strong></p>
            {isEditing ? (
                <DatePicker
                    value={birthDate ? dayjs(birthDate) : null}
                    onChange={(date, dateString) => {
                        if (typeof dateString === "string") {
                            setBirthDate(dateString);
                        } else {
                            setBirthDate(null);
                        }
                    }}
                />
            ) : (
                <p>{birthDate || "Not set"}</p>
            )}

            {loggedInUsername === user.username && (
                <div style={{ marginTop: 16 }}>
                    {isEditing ? (
                        <>
                            <Button type="primary" onClick={handleSaveChanges} style={{ marginRight: 8 }}>
                                Save
                            </Button>
                            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        </>
                    ) : (
                        <Button type="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            )}
        </Card>
    );
};

export default UserProfilePage;