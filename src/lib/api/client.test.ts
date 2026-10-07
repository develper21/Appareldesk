import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getApiErrorMessage } from "./client";

function axiosError(status: number, data?: unknown) {
  const error = new AxiosError(
    "Request failed with status code " + status,
    "ERR_BAD_REQUEST",
    { headers: new AxiosHeaders() },
    {},
    {
      status,
      statusText: "Error",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
      data,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  );
  return error;
}

describe("getApiErrorMessage", () => {
  it("extracts the message from a NestJS error body", () => {
    expect(getApiErrorMessage(axiosError(400, { statusCode: 400, message: "Product not found" }))).toBe(
      "Product not found"
    );
  });

  it("joins class-validator message arrays", () => {
    const msg = getApiErrorMessage(
      axiosError(400, { statusCode: 400, message: ["name should not be empty", "price must be a number"] })
    );
    expect(msg).toBe("name should not be empty, price must be a number");
  });

  it("falls back to the axios message when the body has no message", () => {
    expect(getApiErrorMessage(axiosError(500))).toMatch(/request failed/i);
  });

  it("handles plain Error instances", () => {
    expect(getApiErrorMessage(new Error("Network offline"))).toBe("Network offline");
  });

  it("never explodes on unknown input", () => {
    expect(getApiErrorMessage(undefined)).toBe("Something went wrong");
    expect(getApiErrorMessage("weird")).toBe("Something went wrong");
  });
});
