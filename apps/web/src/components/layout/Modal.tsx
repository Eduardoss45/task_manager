import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useState } from "react";
import { ResetPasswordForm } from "../auth/ResetPasswordForm";

type AuthTab = "login" | "register" | "forgot";

export function Modal() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<AuthTab>("login");

  function handleTabChange(value: string) {
    if (value === "login" || value === "register" || value === "forgot") {
      setTab(value);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle>Autenticação</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="forgot">Reset</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>

          <TabsContent value="forgot">
            <ForgotPasswordForm
              onToken={t => {
                setToken(t);
              }}
            />

            {token && (
              <ResetPasswordForm
                token={token}
                onSuccess={() => {
                  setToken(null);
                  setTab("login");
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
