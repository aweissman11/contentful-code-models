import { describe, it, expect, vi, beforeEach } from "vitest";
import contentfulManagement from "contentful-management";
import { createManagementClient } from "../createManagementClient";

// Mock the contentful-management module
vi.mock("contentful-management", () => ({
  default: {
    createClient: vi.fn(),
  },
}));

describe("createManagementClient", () => {
  const mockCreateClient = vi.mocked(contentfulManagement.createClient);
  const mockClient = { mocked: "client" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue(mockClient as any);
  });

  it("should create a client with valid parameters", () => {
    const params = {
      accessToken: "test-token",
      environmentId: "test-env",
      spaceId: "test-space",
    };

    const result = createManagementClient(params);

    expect(mockCreateClient).toHaveBeenCalledWith(
      { accessToken: "test-token" },
      {
        type: "plain",
        defaults: {
          spaceId: "test-space",
          environmentId: "test-env",
        },
      },
    );
    expect(result).toBe(mockClient);
  });

  it("should throw an error when accessToken is missing", () => {
    const params = {
      accessToken: "",
      environmentId: "test-env",
      spaceId: "test-space",
    };

    expect(() => createManagementClient(params)).toThrow(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when environmentId is missing", () => {
    const params = {
      accessToken: "test-token",
      environmentId: "",
      spaceId: "test-space",
    };

    expect(() => createManagementClient(params)).toThrow(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when spaceId is missing", () => {
    const params = {
      accessToken: "test-token",
      environmentId: "test-env",
      spaceId: "",
    };

    expect(() => createManagementClient(params)).toThrow(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when accessToken is undefined", () => {
    const params = {
      accessToken: undefined as any,
      environmentId: "test-env",
      spaceId: "test-space",
    };

    expect(() => createManagementClient(params)).toThrow(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when environmentId is undefined", () => {
    const params = {
      accessToken: "test-token",
      environmentId: undefined as any,
      spaceId: "test-space",
    };

    expect(() => createManagementClient(params)).toThrow(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when spaceId is undefined", () => {
    const params = {
      accessToken: "test-token",
      environmentId: "test-env",
      spaceId: undefined as any,
    };

    expect(() => createManagementClient(params)).toThrow(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when all parameters are missing", () => {
    const params = {
      accessToken: "",
      environmentId: "",
      spaceId: "",
    };

    expect(() => createManagementClient(params)).toThrow(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );

    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});
