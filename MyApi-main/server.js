require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const userLoginApi = require("./sqlroutes/userloginapi");
const flyers = require("./sqlroutes/flyer");
const trackMeal = require("./sqlroutes/trackmealController");
const faq = require("./sqlroutes/faq");
const usermeta = require("./sqlroutes/userMeta");
const geninfo = require("./sqlroutes/genInfo");
const dietSlots = require("./sqlroutes/dieticianSlots");
const usercalls = require("./sqlroutes/userCalls");
const product = require("./sqlroutes/products");
const nutritionist = require("./sqlroutes/nutritionists");
const foodItems = require("./sqlroutes/foodItems");
const foodTemplates = require("./sqlroutes/foodTemplates");
const dietPlans = require("./sqlroutes/dietPlans");
const dietTemplates = require("./sqlroutes/dietTemplates");
const admin = require("./sqlroutes/admin");
const saasPortal = require("./sqlroutes/saasPortal");
const clientSaas = require("./sqlroutes/clientSaas");
const chat = require("./sqlroutes/chat");
const { initChatWebSocket } = require("./chat/websocketServer");
const nutritionistExercises = require("./sqlroutes/nutritionistExercises");
const billing = require("./sqlroutes/billing");
const subscriptionGate = require("./routes/subscriptionGate");

const app = express();
const port = Number(process.env.PORT) || 3000;

const cors = require("cors");

app.use(
  cors({
    origin: [
      "ggp-navy.vercel.app",
      "https://ourganik.in",
      "http://ourganik.in",
      "https://www.ourganik.in",
      "http://www.ourganik.in",
      "https://www.goodgutproject.in",
      "https://goodgutproject.in",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true
  })
);
// Handle preflight requests (OPTIONS)
app.options("*", (req, res) => {
  const allowedOrigins = [
    "ggp-navy.vercel.app",
    "https://ourganik.in",
    "http://ourganik.in",
    "https://www.ourganik.in",
    "http://www.ourganik.in",
    "https://www.goodgutproject.in",
    "https://goodgutproject.in",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.sendStatus(200);
});

// Middleware
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
app.use(bodyParser.json()); // Parse JSON bodies
app.use("/api", subscriptionGate);
app.use("/api", billing);
app.use("/api", userLoginApi);
app.use("/api", flyers);
app.use("/api", faq);
app.use("/api", trackMeal);
app.use("/api", usermeta);
app.use("/api", geninfo);
app.use("/api", dietSlots);
app.use("/api", usercalls);
app.use("/api", product);
app.use("/api", nutritionist);
app.use("/api", foodItems);
app.use("/api", foodTemplates);
app.use("/api", dietPlans);
app.use("/api", dietTemplates);
app.use("/api", admin);
app.use("/api", saasPortal);
app.use("/api", nutritionistExercises);
app.use("/api", clientSaas);
app.use("/api", chat);

// Swagger API docs — open in browser after server starts
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.type("html").send(`
    <h1>Good Gut Project API</h1>
    <ul>
      <li><a href="/test">Health check</a> — GET /test</li>
      <li><a href="/api-docs">Swagger UI</a> — interactive API docs</li>
      <li><a href="/api/version">Version</a> — GET /api/version</li>
    </ul>
    <p>Server running on port ${port}. MySQL must be reachable for /api routes that use the database.</p>
  `);
});

app.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Server is running",
    port,
    docs: `http://localhost:${port}/api-docs`,
  });
});

// Start server
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs:  http://localhost:${port}/api-docs`);
  console.log(`Health check:  http://localhost:${port}/test`);
});

initChatWebSocket(server, app);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${port} is already in use. Either:\n` +
        `  1. Stop the other process:  netstat -ano | findstr :${port}   then   taskkill /PID <pid> /F\n` +
        `  2. Use another port in .env:  PORT=3001\n`
    );
    process.exit(1);
  }
  throw err;
});
