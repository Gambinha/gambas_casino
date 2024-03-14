"use client";

import { useState } from "react";
import LoginForm from "./components/login-form";
import SignupForm from "./components/signup-form";

export type AuthFormData = {
  username: string;
  password: string;
};

export default function AuthForms() {
  const [isSignup, setIsSignup] = useState(true);

  const handleToggle = () => {
    setIsSignup((prevIsSignup) => !prevIsSignup);
  };

  const handleSubmit = async (data: AuthFormData) => {
    console.log(data);
    // Criptografar a senha

    if (isSignup) {
      console.log(process.env.NEXT_PUBLIC_API_URL);
      await sign(data);
    } else {
      const resp = fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }
  };

  const sign = async (data: AuthFormData) => {
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (resp.status === 201) {
        const json = await resp.json();
        console.log("Conta criada com sucesso");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const login = async (data: AuthFormData) => {
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await resp.json();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      {isSignup ? (
        <SignupForm onSubmit={handleSubmit} />
      ) : (
        <LoginForm onSubmit={handleSubmit} />
      )}
      <button onClick={handleToggle}>
        {isSignup
          ? "Já possui uma conta? Faça seu login"
          : "Não possui uma conta? Cadastre-se"}
      </button>
    </div>
  );
}
