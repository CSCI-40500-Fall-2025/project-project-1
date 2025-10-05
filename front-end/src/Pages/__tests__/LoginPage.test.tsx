import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPane from "../LoginPage/LoginPane";
import LoginPage from "../LoginPage";
import { vi } from "vitest";
import * as userServices from "../../services/userServices";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual: typeof import("react-router-dom") =
    await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../services/userServices", () => ({
  loginUser: vi.fn(),
}));

const mockedLoginUser = vi.mocked(userServices.loginUser);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders LoginPane by default", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/i })).toBeInTheDocument();
  });

  test("switches to RegisterPane when clicking 'Sign up'", async () => {
    render(<LoginPage />);

    const switchButton = screen.getByText(/Sign up/i);
    await userEvent.click(switchButton);

    expect(
      screen.getByRole("textbox", { name: "Username" })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();

    const passwordFields = screen.getAllByLabelText(/Password/i);
    expect(passwordFields.length).toBe(2); // Password and Confirm Password
    expect(passwordFields[0]).toBeInTheDocument();
    expect(passwordFields[1]).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register/i })
    ).toBeInTheDocument();
  });

  describe("LoginPane", () => {
    test("renders form fields and button", () => {
      render(<LoginPane onSwitchToRegister={() => {}} />);
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Log In/i })
      ).toBeInTheDocument();
    });

    test("shows validation errors when fields empty", async () => {
      render(<LoginPane onSwitchToRegister={() => {}} />);
      await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

      expect(
        await screen.findByText(/Please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/Password must be at least 6 characters long/i)
      ).toBeInTheDocument();
    });

    test("calls loginUser and navigates on success", async () => {
      mockedLoginUser.mockResolvedValue({ id: 1 });

      render(<LoginPane onSwitchToRegister={() => {}} />);

      await userEvent.type(screen.getByLabelText(/Email/i), "test@example.com");
      await userEvent.type(screen.getByLabelText(/Password/i), "password123");
      await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

      expect(mockedLoginUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/home");
      });
    });
  });
  // describe("RegisterPane", () => {});
});
