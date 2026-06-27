Innovation. Integration. Impact. 

## **Docsafe Phase 1** 

## **Detailed Developer Specification** 

**Document Type Project Name Phase Stack** 

## **Primary Output** 

Execution-ready project specification 

Docsafe Phase 1 

Node.js, TypeScript, NestJS, Fastify, PostgreSQL, Prisma, React Working backend APIs + web screens 

_Instruction to team: do not start coding until you understand the scope, folder structure, tables, APIs, validation rules, and sample screens in this document._ 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** This document is confidential and intended for internal development use only. _1 of 18_ 

Innovation. Integration. Impact. 

## **1. Project overview** 

- Docsafe is a document and compliance management system. 

- It is intended for organizations that need to store documents, track expiry dates, manage compliance items, and monitor document health through a dashboard.. 

- The goal of Phase 1 is a stable, maintainable web-first with reusable APIs. 

## **2. Scope of Phase 1** 

- Document categories 

- Document creation and metadata management 

- File upload and file reference storage 

- Compliance item creation and status tracking 

- Expiry and renewal tracking 

- Dashboard counts and quick lists 

- Document history / audit visibility 

- Tenant-aware data isolation 

- Role-based visibility 

## **3. Mandatory technology stack** 

- Backend runtime: Node.js 

- Backend language: TypeScript 

- Backend framework: NestJS 

- HTTP adapter: Fastify 

- Database: PostgreSQL 

- ORM: Prisma 

- Frontend: React + TypeScript 

- Authentication: JWT 

- Authorization: RBAC 

- API style: REST 

- Storage: abstraction layer, local first, future S3-compatible 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _2 of 18_ 

Innovation. Integration. Impact. 

## **4. Overall folder structure** 

- Use the following project structure strictly. 

`src/ core/ auth/ tenants/ users/ roles/ audit/ notifications/ storage/ modules/ docsafe/ api/ domain/ application/ infrastructure/ events/ shared/ constants/ enums/ utils/ validators/ exceptions/` 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _3 of 18_ 

Innovation. Integration. Impact. 

## **5. Folder usage rules** 

|**Folder**|**Purpose**|
|---|---|
|core/|Common reusable logic only. Examples: JWT auth, user<br>model, roles, audit logger, storage provider interface.|
|modules/docsafe/api/|HTTP controllers, request DTOs, response DTOs, route<br>mappings.|
|modules/docsafe/domain/|Entities, enums, business rules, value objects, domain-<br>level helper logic.|
|modules/docsafe/application/|Use-cases and service-level orchestration. This is the<br>main business flow layer.|
|modules/docsafe/infrastructure/|Repositories, Prisma mappings, DB persistence code,<br>storage connector use.|
|modules/docsafe/events/|Document/compliance event definitions if required in<br>MVP.|
|shared/|Generic validators, constants, utilities and exceptions<br>that are not specific to one module.|



## **6. Core functional modules** 

## **6.1 Category management** 

- Create category 

- List categories 

- Update category 

- Activate/deactivate category 

- Examples: License, Tax, Insurance, Agreement, Vendor Document, Employee Document 

## **6.2 Document management** 

- Create document record 

- Upload file 

- Store metadata 

- List documents 

- Search/filter documents 

- Update metadata 

- View details 

- View history 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _4 of 18_ 

Innovation. Integration. Impact. 

## **6.3 Compliance management** 

- Create compliance item 

- List compliance items 

- Update compliance item 

- Link item to document where applicable 

- Update compliance status 

## **6.4 Expiry and renewal** 

- Identify expiring-soon documents 

- Identify expired documents 

- Initiate renewal 

- Track renewal status 

- Maintain renewal history 

## **6.5 Dashboard and history** 

- Summary counts 

- Quick lists 

- Recent activity 

- Document-specific history 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _5 of 18_ 

Innovation. Integration. Impact. 

## **7. Database design** 

_All records must be tenant-aware. All business tables must include at minimum: id, tenant_id, created_at, updated_at._ 

|_created_at, updated_at._|||
|---|---|---|
|**Table**|**Purpose**|**Minimum fields**|
|docsafe_categories|Stores category<br>master data for<br>documents.|id, tenant_id, name,<br>description, is_active,<br>created_by, created_at,|
|||updated_at|
|||id, tenant_id, category_id,|
|||title, description, file_asset_id,|
||Stores document|owner_user_id, issue_date,|
|docsafe_documents|metadata and file|expiry_date,|
||reference.|renewal_due_date, status,|
|||visibility_scope, uploaded_by,|
|||created_at, updated_at|
|||id, tenant_id, name,|
|docsafe_compliance_items|Stores compliance<br>obligations.|Stores compliance<br>category_id,<br>linked_document_id,<br>due_date, severity, status,|
|||notes, created_at, updated_at|
|||id, tenant_id, document_id,|
|docsafe_renewal_records|Stores renewal<br>lifecycle records.|initiated_by, initiated_at,<br>stage, remarks, completed_at,|
|||status|
||Stores document|id, tenant_id, document_id,|
|docsafe_document_events|activity events.|event_type, payload_json,<br>triggered_by, triggered_at|



**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _6 of 18_ 

Innovation. Integration. Impact. 

## **8. Detailed entity definition** 

## **Category** 

- id: uuid / primary key 

- tenant_id: uuid / required 

- name: string / required / unique within tenant 

- description: string / optional 

- is_active: boolean / default true 

- created_by: uuid / user reference 

- created_at: timestamp 

- updated_at: timestamp 

## **Document** 

- id: uuid / primary key 

- tenant_id: uuid / required 

- category_id: uuid / required 

- title: string / required 

- description: text / optional 

- file_asset_id: uuid / required after upload 

- owner_user_id: uuid / optional 

- issue_date: date / required 

- expiry_date: date / required 

- renewal_due_date: date / optional 

- status: enum / required 

- visibility_scope: enum or string / optional 

- uploaded_by: uuid / required 

- created_at: timestamp 

- updated_at: timestamp 

## **Compliance Item** 

- id: uuid / primary key 

- tenant_id: uuid / required 

- name: string / required 

- category_id: uuid / optional or required based on implementation 

- linked_document_id: uuid / optional 

- due_date: date / optional 

- severity: enum / Low/Medium/High 

- status: enum / required 

- notes: text / optional 

- created_at: timestamp 

- updated_at: timestamp 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _7 of 18_ 

Innovation. Integration. Impact. 

## **Renewal Record** 

- id: uuid / primary key 

- tenant_id: uuid / required 

- document_id: uuid / required 

- initiated_by: uuid / required 

- initiated_at: timestamp / required 

- stage: string / required 

- remarks: text / optional 

- completed_at: timestamp / optional 

- status: enum / required 

## **Document Event** 

- id: uuid / primary key 

- tenant_id: uuid / required 

- document_id: uuid / required 

- event_type: string / required 

- payload_json: json / optional 

- triggered_by: uuid / optional 

- triggered_at: timestamp / required 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _8 of 18_ 

Innovation. Integration. Impact. 

## **9. Enum definitions** 

## **DocumentStatus** 

- ACTIVE 

- EXPIRING_SOON 

- EXPIRED 

- RENEWAL_IN_PROGRESS 

- ARCHIVED 

- MISSING 

## **ComplianceStatus** 

- COMPLIANT 

- PENDING 

- MISSING 

- EXPIRED 

- UNDER_REVIEW 

## **RenewalStatus** 

- NOT_STARTED 

- INITIATED 

- IN_PROGRESS 

- COMPLETED 

- REJECTED 

_Use centralized enums. Do not hardcode status strings in multiple files._ 

## **10. API design** 

_All APIs must be reusable for web now and future mobile later. Every API must be tenant-aware, return consistent response format, and validate input strictly._ 

## **10.1 Category APIs** 

- POST   /api/docsafe/categories 

- GET    /api/docsafe/categories 

- GET    /api/docsafe/categories/:id 

- PUT    /api/docsafe/categories/:id 

- DELETE /api/docsafe/categories/:id 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _9 of 18_ 

Innovation. Integration. Impact. 

## **10.2 Document APIs** 

- POST   /api/docsafe/documents 

- GET    /api/docsafe/documents 

- GET    /api/docsafe/documents/:id 

- PUT    /api/docsafe/documents/:id 

- POST   /api/docsafe/documents/:id/upload 

- POST   /api/docsafe/documents/:id/renewal 

- GET    /api/docsafe/documents/:id/history 

## **10.3 Compliance APIs** 

- POST   /api/docsafe/compliance-items 

- GET    /api/docsafe/compliance-items 

- GET    /api/docsafe/compliance-items/:id 

- PUT    /api/docsafe/compliance-items/:id 

## **10.4 Dashboard APIs** 

- GET /api/docsafe/dashboard/summary 

- GET /api/docsafe/dashboard/expiring-soon 

- GET /api/docsafe/dashboard/expired 

- GET /api/docsafe/dashboard/missing 

## **10.5 Search and filter APIs** 

- GET /api/docsafe/search/documents 

- GET /api/docsafe/search/compliance-items 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _10 of 18_ 

Innovation. Integration. Impact. 

## **11. Sample API payloads** 

## **11.1 Create category request** 

`POST /api/docsafe/categories {  "name": "License", "description": "Government and trade licenses", "isActive": true }` 

## **11.2 Create category success response** 

`{ "success": true, "message": "Category created successfully", "data": { "id": "cat_001", "name": "License", "description": "Government and trade licenses", "isActive": true } }` 

## **11.3 Create document request** 

`POST /api/docsafe/documents { "title": "Trade License 2026", "categoryId": "cat_001", "ownerUserId": "usr_014", "issueDate": "2026-01-01", "expiryDate": "2027-01-01", "renewalDueDate": "2026-12-15", "description": "Primary trade license for Chennai office" }` **11.4 Create document response** `{ "success": true, "message": "Document created successfully", "data": { "id": "doc_101", "title": "Trade License 2026", "status": "ACTIVE" } }` 

## **11.4 Create document response** 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _11 of 18_ 

Innovation. Integration. Impact. 

## **11.5 Compliance item request** 

`POST /api/docsafe/compliance-items { "name": "Trade license renewal", "linkedDocumentId": "doc_101", "dueDate": "2026-12-15", "severity": "HIGH", "status": "PENDING", "notes": "Renewal to begin 30 days in advance" }` 

## **12. API response standard** 

`Success: { "success": true, "message": "Success message", "data": {} } Error: { "success": false, "message": "Error message", "errors": [] }` 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _12 of 18_ 

Innovation. Integration. Impact. 

## **13. Validation rules** 

- Required fields must be validated. 

- Validate tenant ownership on every reference. 

- Validate category_id, owner_user_id, linked_document_id before save. 

- expiry_date must be greater than or equal to issue_date. 

- renewal_due_date should not be later than expiry_date unless justified by business rule. 

- Reject invalid enum values. 

- Reject cross-tenant linked references. 

- Reject file upload if file type or size is not allowed. 

## **14. Auth, roles and tenant rules** 

- Use JWT-based authentication. 

- Every Docsafe record must belong to a tenant. 

- Every query must be tenant-scoped. 

- No cross-tenant data should be returned. 

- Minimum roles: Super Admin, Org Admin, Compliance Manager, Uploader, Reviewer, Viewer. 

- Apply role checks at service or controller guard level. 

- Repository and service logic must never bypass tenant filters. 

## **15. File upload and storage rules** 

- Store actual files through a storage abstraction layer. 

- Local storage is acceptable for Phase 1, but implementation should not hardcode business logic into storage path handling. 

- Store file metadata in core_file_assets or equivalent storage table if used. 

- Allowed file types at minimum: PDF, PNG, JPG, JPEG. 

- Validate file size before save. 

- Store file reference against document record after successful upload. 

## **16. Audit and history design** 

- Create audit entries for category created, document created, file uploaded, document updated, renewal initiated, and compliance status changed. 

- Minimum audit fields: actor, action, target_entity, target_entity_id, timestamp. 

- Document history screen should read from event/audit records, not from hardcoded UI state. 

- Prefer one shared audit logger pattern rather than writing separate ad hoc history code. 

## **17. Search, filtering and pagination** 

- List APIs must support pagination. 

- Document list must support search by title. 

- Document list filters: category, status, expiry date range. 

- Compliance list filters: status, severity, search text. 

- Dashboard quick lists should call filtered APIs or dedicated lightweight endpoints. 

- Do not return full unpaginated lists by default. 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _13 of 18_ 

Innovation. Integration. Impact. 

## **18. Dashboard logic** 

- Total documents = count of all active and archived docs within tenant unless explicitly excluded. 

- Active documents = docs with status ACTIVE. 

- Expiring soon = docs whose expiry date falls within a configured window such as 30 days. 

- Expired = docs with expiry date earlier than current date or explicit EXPIRED status. 

- Missing compliance items = items with status MISSING. 

- Renewal in progress = docs or renewal records with renewal status INITIATED or IN_PROGRESS. 

## **19. Frontend sample screens** 

_These are reference layouts for frontend development. They are not final visual mockups, but they define required sections, fields, filters, and actions._ 

## **19.1 Dashboard screen** 

`-----------------------------------------------------------| Docsafe Dashboard                                        | -----------------------------------------------------------| Total Documents | Active | Expiring Soon | Expired | -----------------------------------------------------------| Missing Compliance | Renewal In Progress                | -----------------------------------------------------------| Recent Activity                                         | | - Document uploaded                                     | | - Renewal initiated                                     | | - Compliance status updated                             | -----------------------------------------------------------| Quick Lists                                             | | - Expiring Soon Documents                               | | - Missing Compliance Items                              | ------------------------------------------------------------` 

- Summary cards must be clickable where possible. 

- Recent activity should show latest 5 to 10 events. 

- Quick lists should show title, date/status, and view action. 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _14 of 18_ 

Innovation. Integration. Impact. 

## **19.2 Documents list screen** 

`--------------------------------------------------------------------------| Documents                                                   [Add Document] | --------------------------------------------------------------------------| Search | Category Filter | Status Filter | Date Filter | Reset Filter     | --------------------------------------------------------------------------| Title | Category | Owner | Issue Date | Expiry Date | Status | Actions    | --------------------------------------------------------------------------| ... rows ...                                                            | --------------------------------------------------------------------------| Pagination: Prev 1 2 3 Next                                             | ---------------------------------------------------------------------------` 

- Columns: title, category, owner, issue date, expiry date, status, actions. 

- Actions: View, Edit. 

- Filters: search by title, category, status, expiry date range. 

## **19.3 Create / upload document screen** 

`------------------------------------------------------------` 

`| Add Document                                             | -----------------------------------------------------------| Title                [____________________________]      | | Category             [Dropdown___________________]       | | Owner                [Dropdown / Input___________]       | | Issue Date           [____/____/________]               | | Expiry Date          [____/____/________]               | | Renewal Due Date     [____/____/________]               | | Description          [____________________________]      | |                     [____________________________]       | | File Upload          [Choose File]                      | -----------------------------------------------------------| [Save Document]   [Cancel]                              | ------------------------------------------------------------` 

- Required fields: title, category, issue date, expiry date, file. 

- Show field-level validation messages. 

- Prevent save on invalid dates or missing required values. 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _15 of 18_ 

Innovation. Integration. Impact. 

## **19.4 Document detail screen** 

`-----------------------------------------------------------| Document Detail                                          | -----------------------------------------------------------| Title: Trade License 2026                                | | Category: License                                        | | Owner: Admin                                             | | Issue Date: 01-01-2026                                   | | Expiry Date: 01-01-2027                                  | | Renewal Due Date: 15-12-2026                             | | Status: Active                                           | -----------------------------------------------------------| File Information                                          | | File Name: trade_license_2026.pdf                        | | [View File] [Download File]                              | -----------------------------------------------------------| Linked Compliance Item                                    | | Trade License Renewal                                     | | Status: Pending                                           | -----------------------------------------------------------| Renewal Information                                       | | Renewal Status: Not Started                               | -----------------------------------------------------------| History / Activity                                        | | - Document created                                        | | - File uploaded                                           | | - Metadata updated                                        | ------------------------------------------------------------` 

- Sections: metadata, file information, linked compliance item, renewal info, history. 

- Actions: Edit, View File, Download File, Back. 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _16 of 18_ 

Innovation. Integration. Impact. 

## **19.5 Compliance list screen** 

`--------------------------------------------------------------------------------` 

`| Compliance Items                                              [Add Compliance] |` 

`--------------------------------------------------------------------------------` 

`| Search | Status Filter | Severity Filter | Reset Filter                      |` 

`--------------------------------------------------------------------------------` 

`| Name | Linked Document | Due Date | Severity | Status | Actions              | -------------------------------------------------------------------------------| ... rows ...                                                                |` 

`--------------------------------------------------------------------------------` 

- Columns: name, linked document, due date, severity, status, actions. 

- Actions: View, Edit, Update Status. 

## **19.6 Expiring soon screen** 

`---------------------------------------------------------------------------` 

`| Expiring Soon Documents                                                  | ---------------------------------------------------------------------------` 

`| Search | Category Filter | Days Filter (7/15/30) | Reset Filter         | ---------------------------------------------------------------------------` 

`| Title | Category | Owner | Expiry Date | Days Left | Status | Actions   | ---------------------------------------------------------------------------` 

- Actions: View, Start Renewal. 

- Days filter helps identify urgency. 

## **20. Frontend behavior rules** 

- Use reusable table and form components where possible. 

- Show clear validation errors below fields or beside controls. 

- Use loading states and empty states. 

- Show 'No data found' clearly when lists are empty. 

- Use badges or chips for status values. 

- Do not hardcode backend enum values differently from API responses. 

## **21. Coding rules** 

- Do keep controllers thin. 

- Do keep business logic in application/domain services. 

- Do separate repository code from business logic. 

- Do use centralized enums and validators. 

- Do keep code modular and readable. 

- Do not place DB queries directly in controllers. 

- Do not create duplicate auth, role, audit, tenant, or file-storage logic inside Docsafe module. 

- Do not mix controller, repository, and service logic in a single file. 

- Do not add extra features unless approved. 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _17 of 18_ 

Innovation. Integration. Impact. 

## **22. Completion checklist** 

1. Project uses the approved stack. 

2. Folder structure is followed correctly. 

3. Approved tables and entities are created. 

4. Approved APIs are implemented. 

5. Validation is implemented properly. 

6. Tenant filtering is applied everywhere. 

7. Audit entries are created where needed. 

8. Frontend screens work end-to-end for assigned scope. 

9. Document upload works. 

10. Compliance and renewal flows work. 

11. Dashboard counts and quick lists work. 

12. No duplicate common logic is created inside Docsafe. 

## **23. Final instruction to developers** 

- Follow this document as the implementation standard. 

- Ask questions early if anything is unclear. 

- Deliver working features, not partial placeholders. 

**© 2026 Vistalane Dynamic Solutions Pvt. Ltd.** 

This document is confidential and intended for internal development use only. _18 of 18_ 

