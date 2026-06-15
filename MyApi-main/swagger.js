const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Good Gut Project (GGP) API",
    version: "1.0.0",
    description:
      "REST API for Good Gut Project — users, meals, nutritionists, diet plans, and products. Base path: `/api`.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
    {
      url: "https://gg.shakyaconsultants.com",
      description: "Production",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      apiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
      },
    },
  },
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Meals" },
    { name: "Content" },
    { name: "Nutritionists" },
    { name: "Food" },
    { name: "Products" },
  ],
  paths: {
    "/test": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: { description: "Server is running" },
        },
      },
    },
    "/api/version": {
      get: {
        tags: ["Health"],
        summary: "API version",
        responses: {
          200: {
            description: "Version object",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { version: { type: "string", example: "1.0.0" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "JWT token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { token: { type: "string" } },
                },
              },
            },
          },
          401: { description: "Invalid credentials" },
          403: { description: "Account not activated" },
        },
      },
    },
    "/api/userdata": {
      post: {
        tags: ["Users"],
        summary: "Create or update user profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  gender: { type: "string" },
                  dob: { type: "string" },
                  height: { type: "number" },
                  weight: { type: "number" },
                  medical: { type: "string" },
                  goal: { type: "string" },
                  targetWeight: { type: "number" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated" }, 201: { description: "Created" } },
      },
    },
    "/api/usermeta": {
      get: {
        tags: ["Users"],
        summary: "Get logged-in user profile",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "User metadata" } },
      },
    },
    "/api/addmeal": {
      post: {
        tags: ["Meals"],
        summary: "Log a meal",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  mealDate: { type: "string", example: "2025-06-02" },
                  name: { type: "string" },
                  quantity: { type: "number" },
                  kcal: { type: "number" },
                  p: { type: "number" },
                  c: { type: "number" },
                  f: { type: "number" },
                  mealType: { type: "string" },
                  isVeg: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Meal added" } },
      },
    },
    "/api/trackmeal": {
      get: {
        tags: ["Meals"],
        summary: "Get meals for a date",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "date",
            in: "query",
            required: true,
            schema: { type: "string", example: "2025-06-02" },
          },
        ],
        responses: { 200: { description: "List of meals" } },
      },
      delete: {
        tags: ["Meals"],
        summary: "Delete a meal",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { mealId: { type: "integer" } },
              },
            },
          },
        },
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/api/flyer": {
      get: {
        tags: ["Content"],
        summary: "List flyers",
        responses: { 200: { description: "Flyer array" } },
      },
    },
    "/api/faq": {
      get: {
        tags: ["Content"],
        summary: "List FAQs",
        responses: { 200: { description: "FAQ array" } },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "min_price", in: "query", schema: { type: "number" } },
          { name: "max_price", in: "query", schema: { type: "number" } },
        ],
        responses: { 200: { description: "Products" } },
      },
    },
    "/api/nutritionists/login": {
      post: {
        tags: ["Nutritionists"],
        summary: "Nutritionist login",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Token + profile" } },
      },
    },
    "/api/fooditems": {
      get: {
        tags: ["Food"],
        summary: "List all food items",
        responses: { 200: { description: "Food items" } },
      },
      post: {
        tags: ["Food"],
        summary: "Add food item",
        responses: { 201: { description: "Created" } },
      },
    },
  },
};

module.exports = swaggerDefinition;
