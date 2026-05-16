import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const outputDir = path.resolve("docs");
const outputPath = path.join(outputDir, "Smart-Clinic-Study-Guide.pdf");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const doc = new PDFDocument({
  size: "A4",
  margin: 50,
  bufferPages: true,
  info: {
    Title: "Smart Clinic Study Guide",
    Author: "Smart Clinic Team",
    Subject: "Architecture, Database Design, Testing and Viva Preparation"
  }
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

let pageNum = 1;
doc.on("pageAdded", () => {
  pageNum += 1;
});

function footer() {
  const y = doc.page.height - 35;
  doc.fontSize(9).fillColor("#666").text(`Page ${pageNum}`, 50, y, { align: "center", width: doc.page.width - 100 });
  doc.fillColor("black");
}

function newPage() {
  doc.addPage();
}

function heading(text) {
  doc.font("Helvetica-Bold").fontSize(22).text(text);
  doc.moveDown(0.5);
}

function subHeading(text) {
  doc.font("Helvetica-Bold").fontSize(14).text(text);
  doc.moveDown(0.3);
}

function para(text) {
  doc.font("Helvetica").fontSize(11).text(text, { align: "left", lineGap: 3 });
  doc.moveDown(0.5);
}

function bullet(items) {
  items.forEach((item) => {
    doc.font("Helvetica").fontSize(11).text(`- ${item}`, { lineGap: 2 });
  });
  doc.moveDown(0.5);
}

const toc = [];
function chapter(title, writer) {
  newPage();
  toc.push({ title, page: pageNum, owner: writer });
  heading(title);
}

// Cover
heading("Smart Clinic Management System");
doc.font("Helvetica-Bold").fontSize(16).text("Project Study and Viva Preparation Guide");
doc.moveDown(1);
para("This PDF is prepared for final project discussion in university. It explains architecture, code organization, database design, testing strategy, and how to implement requirement changes quickly during discussion.");
para("Main stack:");
bullet([
  "Frontend: React + Vite + Axios + React Router",
  "Backend: Node.js + Express + MySQL + JWT",
  "Security: Role-based access control (admin, doctor, patient)"
]);
para("Team mode during viva: one person drives the code, one person explains architecture, one person explains database and queries, one person explains testing, one person handles change requests.");
footer();

// TOC placeholder page
newPage();
heading("Table of Contents");
para("Page numbers are listed for fast revision.");
const tocStartY = doc.y;
footer();

chapter("Chapter 1: System Overview and Business Flow", "Person 1");
subHeading("What problem this system solves");
para("The system digitizes clinic operations: doctor availability management, patient booking, appointment tracking, and role-specific control for clinic admins.");
subHeading("Core roles and permissions");
bullet([
  "Admin: manage doctors, slots, appointments dashboard.",
  "Doctor: view own schedule, complete/cancel appointments.",
  "Patient: browse doctors, book slot, view/cancel own appointments."
]);
subHeading("End-to-end flow");
bullet([
  "Admin creates doctor profiles and time slots.",
  "Patient books available slot for a doctor.",
  "Slot status changes from available to booked.",
  "Appointment appears in patient, doctor, and admin views.",
  "Doctor marks appointment completed or cancelled."
]);
footer();

chapter("Chapter 2: Architecture (High-Level)", "Person 1");
subHeading("Architecture style");
para("Layered web architecture with clear separation between UI, API, and data. Frontend never talks directly to MySQL. It calls backend endpoints. Backend enforces business rules and security.");
subHeading("Frontend layers");
bullet([
  "Pages: role dashboards and screens.",
  "Components: reusable layout, guards, status components.",
  "State: AuthContext for current user/session.",
  "API services: centralized Axios calls."
]);
subHeading("Backend layers");
bullet([
  "Routes: endpoint mapping.",
  "Controllers: request handling and response shaping.",
  "Middleware: auth, role checks, error handling.",
  "Data access: MySQL pool and query helper."
]);
footer();

chapter("Chapter 3: Frontend Code Structure", "Person 2");
subHeading("Important frontend files");
bullet([
  "src/App.jsx: route tree and role-based route groups.",
  "src/components/ProtectedRoute.jsx: blocks unauthorized access.",
  "src/state/AuthContext.jsx: login/register/logout and session restore.",
  "src/api/client.js + services.js: API contracts and token injection."
]);
subHeading("How token is used");
para("JWT token is stored in localStorage after login. Axios interceptor automatically sends Authorization: Bearer <token> in every request.");
subHeading("How role navigation works");
para("After login, routeForRole(role) sends users to their home path. ProtectedRoute also validates allowed roles and redirects wrong role users.");
footer();

chapter("Chapter 4: Backend Code Structure", "Person 2");
subHeading("Important backend files");
bullet([
  "src/app.js: app initialization, middleware, route registration.",
  "src/server.js: DB readiness check + server start.",
  "src/config/db.js: mysql2 pool and query helper.",
  "src/middleware/authMiddleware.js: JWT verification and role restriction."
]);
subHeading("Controller responsibilities");
bullet([
  "authController: login/register/me.",
  "doctorController: list/create/update/deactivate doctor.",
  "slotController: list/create/delete slot.",
  "appointmentController: booking transaction + status update.",
  "dashboardController: aggregated stats for admin."
]);
footer();

chapter("Chapter 5: API Endpoint Map", "Person 2");
subHeading("Authentication");
bullet([
  "POST /api/auth/register",
  "POST /api/auth/login",
  "GET /api/auth/me"
]);
subHeading("Doctors and slots");
bullet([
  "GET /api/doctors",
  "POST /api/doctors (admin)",
  "PUT /api/doctors/:id (admin)",
  "DELETE /api/doctors/:id (admin deactivate)",
  "GET /api/slots",
  "POST /api/slots (admin)",
  "DELETE /api/slots/:id (admin)"
]);
subHeading("Appointments and dashboard");
bullet([
  "GET /api/appointments",
  "POST /api/appointments (patient booking)",
  "PATCH /api/appointments/:id/status",
  "GET /api/dashboard/stats (admin)"
]);
footer();

chapter("Chapter 6: Database Design", "Person 3");
subHeading("Tables");
bullet([
  "users: all accounts with role field.",
  "slots: doctor availability windows.",
  "appointments: patient booking record linked to slot."
]);
subHeading("Key relationships");
bullet([
  "slots.doctor_id -> users.id",
  "appointments.patient_id -> users.id",
  "appointments.doctor_id -> users.id",
  "appointments.slot_id -> slots.id (unique)"
]);
subHeading("Important constraints");
bullet([
  "Unique email in users.",
  "Slot has CHECK end_time > start_time.",
  "One appointment per slot via unique slot_id in appointments."
]);
footer();

chapter("Chapter 7: SQL and Transactions", "Person 3");
subHeading("Why transaction is required on booking");
para("Two patients may try to book the same slot at the same time. Without transaction, race condition can create duplicate bookings.");
subHeading("Booking transaction logic");
bullet([
  "BEGIN TRANSACTION",
  "SELECT slot FOR UPDATE where status = available",
  "INSERT appointment",
  "UPDATE slot status to booked",
  "COMMIT"
]);
subHeading("Rollback behavior");
para("If any step fails, rollback keeps data consistent.");
footer();

chapter("Chapter 8: Security Model", "Person 4");
subHeading("Security elements implemented");
bullet([
  "JWT token signing and verification.",
  "Route protection middleware.",
  "Role-based restriction middleware.",
  "CORS configuration with client URL.",
  "Helmet for HTTP security headers."
]);
subHeading("Role rules examples");
bullet([
  "Only admin can create doctor and slots.",
  "Only patient can book appointment.",
  "Patient can only cancel own appointments.",
  "Doctor can only update status in own schedule."
]);
footer();

chapter("Chapter 9: Testing Strategy for Viva", "Person 4");
subHeading("Manual test matrix");
bullet([
  "Auth tests: login success/fail, wrong role selection.",
  "Authorization tests: patient trying admin endpoint should fail 403.",
  "Booking tests: successful booking changes slot status.",
  "Concurrency check: same slot cannot be booked twice.",
  "Status update tests: completed and cancelled flows."
]);
subHeading("What to say in discussion");
para("Testing was done by role-based scenario validation, negative testing for forbidden actions, and state verification in database-backed screens.");
footer();

chapter("Chapter 10: Change Requests During Discussion", "Person 5");
subHeading("Expected professor style requests");
bullet([
  "Add appointment notes mandatory for specific specialization.",
  "Add search by date range in appointments.",
  "Add doctor active/inactive toggle in UI.",
  "Prevent booking within less than 2 hours from current time."
]);
subHeading("How to implement fast");
bullet([
  "Step 1: update backend validation/controller.",
  "Step 2: update frontend form/service payload.",
  "Step 3: add DB column/index only if needed.",
  "Step 4: test role flow impacted by the change."
]);
footer();

chapter("Chapter 11: Example Live Change Walkthrough", "Person 5");
subHeading("Sample requirement");
para("Requirement: Doctor cannot cancel appointment if it is less than 30 minutes before slot start.");
subHeading("Implementation plan");
bullet([
  "Read appointment + slot start_time in update endpoint.",
  "If status change request is cancelled and requester is doctor, compare current time to start_time.",
  "Return 400 with clear message if blocked.",
  "Frontend shows returned message in ErrorMessage component."
]);
subHeading("Why this reflects software principles");
bullet([
  "Encapsulation of business rule in backend domain logic.",
  "Single source of truth for validation.",
  "Consistent UX through API error propagation."
]);
footer();

chapter("Chapter 12: Team Study Plan (5 Members)", "All");
subHeading("Team assignment with chapter ranges");
bullet([
  "Person 1 (Presentation lead): Chapters 1-2",
  "Person 2 (Code structure lead): Chapters 3-5",
  "Person 3 (Database lead): Chapters 6-7",
  "Person 4 (Security and testing lead): Chapters 8-9",
  "Person 5 (Change request lead): Chapters 10-11"
]);
subHeading("Responsibilities in viva");
bullet([
  "Person 1: explain problem, value, and architecture diagram verbally.",
  "Person 2: navigate frontend/backend folders and endpoint flow.",
  "Person 3: explain schema, keys, constraints, and booking transaction.",
  "Person 4: explain JWT, middleware, and test cases.",
  "Person 5: implement requested live change quickly."
]);
subHeading("Quick revision timing");
bullet([
  "Day before: each person reads own chapters twice.",
  "Final rehearsal: 20-minute demo + 20-minute Q&A simulation.",
  "Keep one laptop user as driver, one as observer for QA."
]);
footer();

chapter("Appendix A: Viva Q&A Bank", "All");
bullet([
  "Why JWT and not session cookies?",
  "How do you prevent duplicate booking?",
  "Why keep users in one table with role column?",
  "What happens if token is expired?",
  "How to scale if number of appointments grows x10?",
  "What tests prove authorization is correct?",
  "How do you rollback if booking fails halfway?",
  "How to add notifications feature with minimum changes?"
]);
footer();

chapter("Appendix B: Is This System Enough?", "All");
para("For a university principles-of-software project, this implementation is enough if you demonstrate it cleanly and explain design decisions well. It includes role-based architecture, persistent database, secure auth, business flow coverage, and practical change-readiness.");
subHeading("What makes it acceptable");
bullet([
  "Clear separation of concerns.",
  "Real database design with keys and constraints.",
  "Role-based authorization rules.",
  "Reproducible setup and seeded demo data.",
  "End-to-end tested core use cases."
]);
subHeading("Optional upgrades if time remains");
bullet([
  "Automated backend API tests.",
  "Pagination and advanced filters.",
  "Audit log for status changes."
]);
footer();

// Fill TOC page
const range = doc.bufferedPageRange();
doc.switchToPage(1);
doc.y = tocStartY;
doc.font("Helvetica").fontSize(11);
toc.forEach((item) => {
  const line = `${item.title} .......................... ${item.page} (Owner: ${item.owner})`;
  doc.text(line);
});
doc.moveDown();
doc.font("Helvetica-Bold").text("Focused Revision Index per Team Member");
doc.font("Helvetica").text("Person 1 -> Pages for Chapters 1-2");
doc.text("Person 2 -> Pages for Chapters 3-5");
doc.text("Person 3 -> Pages for Chapters 6-7");
doc.text("Person 4 -> Pages for Chapters 8-9");
doc.text("Person 5 -> Pages for Chapters 10-11");
doc.fontSize(9).fillColor("#666").text("Page 2", 50, doc.page.height - 35, { align: "center", width: doc.page.width - 100 });

for (let i = 0; i < range.count; i += 1) {
  doc.switchToPage(i);
  if (i !== 1) {
    const label = i + 1;
    doc.fontSize(9).fillColor("#666").text(`Page ${label}`, 50, doc.page.height - 35, { align: "center", width: doc.page.width - 100 });
  }
}

doc.end();

stream.on("finish", () => {
  console.log(`PDF generated: ${outputPath}`);
});
