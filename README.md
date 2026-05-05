# InsureEase — Insurance Policy Management System

> A full-stack insurance platform with role-based workflows for Customers, Underwriters, and Adjusters. Built with Spring Boot 3 + React 18.

![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

| Area | Details |
|---|---|
| **Auth** | JWT-based login & registration, role-aware redirect |
| **Products** | Browse insurance products (Life, Health, Vehicle); Underwriters can create/edit |
| **Premium Calculator** | Age, coverage, duration, vehicle-age factors with animated result card |
| **Policy Application** | Multipart form with KYC document upload and mock payment gate |
| **PDF Certificates** | On-demand iText 7 PDF with embedded ZXing QR code |
| **Claims Workflow** | Spring State Machine enforced: `SUBMITTED → UNDER_REVIEW → APPROVED → DISBURSED` |
| **Dashboards** | Customer stats + policy table; Admin overview with CSS bar charts |
| **Renewal Reminders** | `@Scheduled` cron job logs reminders for policies expiring within 30 days |
| **Storage Abstraction** | `StorageService` interface — swap local disk for S3 with zero controller changes |

---

## Tech Stack

### Backend
- **Java 17** · Spring Boot 3.2.5
- **Spring Security** — stateless JWT, method-level `@PreAuthorize`
- **Spring Data JPA** + Hibernate + PostgreSQL
- **Spring State Machine 3.2.1** — claims lifecycle enforcement
- **iText 7.2.5** — PDF certificate generation
- **ZXing 3.5.3** — QR code embedded in certificates
- **JJWT 0.11.5** — JWT sign/verify
- **Lombok** · Maven

### Frontend
- **React 18** + Vite 5 + TailwindCSS 3
- **@tanstack/react-query v5** — server state, cache invalidation
- **react-hook-form** — form validation
- **react-router-dom v6** — protected routes, role-based guards
- **axios** — API client with JWT interceptors
- **lucide-react** — icons
- **react-toastify** — notifications

---

## Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 17 |
| Maven | 3.8+ |
| Node.js | 18+ |
| PostgreSQL | 14+ |

---

## Getting Started

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE insurexdb;"
psql -U postgres -d insurexdb -f db/init.sql
```

### 2. Backend

```bash
cd backend

# Set JDK 17 if needed
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Review DB credentials
# src/main/resources/application.properties

mvn spring-boot:run
# → http://localhost:8081
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Customer | customer@insurex.com | password123 |
| Underwriter | underwriter@insurex.com | password123 |
| Adjuster | adjuster@insurex.com | password123 |

---

## API Reference

**Base URL:** `http://localhost:8081/api`

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register, returns JWT |
| POST | `/auth/login` | Public | Login, returns JWT |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/products` | Any | List active products |
| GET | `/products/{id}` | Any | Product detail |
| POST | `/products` | UNDERWRITER | Create product |
| PUT | `/products/{id}` | UNDERWRITER | Update product |

### Calculator
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/calculator/estimate` | Any | Returns `{ estimatedPremium }` |

### Policies
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/policies/apply` | CUSTOMER | Multipart: `data` (JSON) + `kycDoc` (file) |
| GET | `/policies/my` | CUSTOMER | Own policies |
| GET | `/policies/{id}/certificate` | CUSTOMER / UNDERWRITER | Download PDF |
| GET | `/policies` | UNDERWRITER | All policies |
| PUT | `/policies/{id}/approve` | UNDERWRITER | PENDING → ACTIVE |
| PUT | `/policies/{id}/reject` | UNDERWRITER | PENDING → REJECTED |

### Claims
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/claims` | CUSTOMER | Multipart: `data` + `proofDoc` |
| GET | `/claims/my` | CUSTOMER | Own claims |
| GET | `/claims` | ADJUSTER | All claims |
| PUT | `/claims/{id}/status` | ADJUSTER | State machine transition |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard/customer` | CUSTOMER | Stats + policy list |
| GET | `/dashboard/admin` | UNDERWRITER / ADJUSTER | Totals + status breakdowns |

---

## Claims State Machine

```
SUBMITTED ──► UNDER_REVIEW ──► APPROVED ──► DISBURSED
                    │
                    └──► REJECTED
```

Invalid transitions return `400 Bad Request`. Enforced by Spring State Machine — the UI dropdown only shows valid next states.

---

## Role Permissions

| Feature | Customer | Underwriter | Adjuster |
|---|:---:|:---:|:---:|
| Browse products | ✓ | ✓ | ✓ |
| Apply for policy | ✓ | | |
| Download certificate | ✓ | ✓ | |
| File a claim | ✓ | | |
| Approve / reject policies | | ✓ | |
| Manage products | | ✓ | |
| Process claims | | | ✓ |
| Admin dashboard | | ✓ | ✓ |

---

## Project Structure

```
web-end-6/
├── backend/                         Spring Boot application
│   └── src/main/java/com/insurex/policy/
│       ├── config/                  Security, JWT, State Machine
│       ├── security/                JwtTokenProvider, JwtAuthFilter
│       ├── entity/                  User, Policy, Claim, InsuranceProduct, RenewalReminder
│       ├── enums/                   Role, PolicyStatus, ClaimStatus, ClaimEvent, ProductType
│       ├── repository/              Spring Data JPA interfaces
│       ├── dto/                     Request + Response DTOs
│       ├── service/                 Business logic + PdfCertificateService + RenewalReminderService
│       │   └── storage/             StorageService interface + LocalStorageService
│       ├── controller/              REST controllers (Auth, Policy, Claim, Product, Dashboard)
│       └── exception/               AppException, GlobalExceptionHandler
│
├── frontend/                        React 18 + Vite + TailwindCSS
│   └── src/
│       ├── api/                     Axios instance with JWT + 401 interceptors
│       ├── context/                 AuthContext (JWT decode + expiry check)
│       ├── hooks/                   useAuth, usePagination
│       ├── components/              Navbar, Layout, Modal, StatusBadge, Spinner, Pagination
│       └── pages/
│           ├── auth/                Login, Register
│           ├── customer/            Products, Calculator, Apply, Dashboard, Claims, ClaimNew
│           └── admin/               AdminDashboard, AdminPolicies, AdminClaims, AdminProducts
│
├── db/
│   └── init.sql                     Schema + seed data (3 products, 3 users)
│
└── README.md
```

---

## Swapping Local Storage for S3

Storage is abstracted behind `StorageService`:

```
backend/src/main/java/com/insurex/policy/service/storage/StorageService.java
```

To switch to AWS S3:
1. Add `software.amazon.awssdk:s3` to `pom.xml`
2. Create `S3StorageService implements StorageService` annotated `@Primary @Service`
3. Inject `S3Client`, implement `store()` with `PutObjectRequest` and `loadAsResource()` via presigned URL
4. Remove `@Primary` from `LocalStorageService`

No other code changes needed.

---

## Configuration

Key properties in `backend/src/main/resources/application.properties`:

```properties
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/insurexdb
app.jwt.secret=<64-char-hex>
app.jwt.expiration-ms=86400000
app.storage.location=./storage
spring.servlet.multipart.max-file-size=10MB
```

---

## License

MIT © 2026 InsureEase Contributors
