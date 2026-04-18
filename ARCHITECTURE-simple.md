# AI Content Marketing Platform - Architecture

## System Architecture

### Layer 1: Frontend (User Interface)
```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 (React 19)                    │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐      │
│  │ Home Page   │  │ Create Page │  │ Dashboard Page  │      │
│  │             │  │             │  │                 │      │
│  │ • Project   │  │ • Topic     │  │ • Blog Editor   │      │
│  │   list      │  │   input     │  │ • Social Editor │      │
│  │ • Status    │  │ • Article   │  │ • Email Editor  │      │
│  │   badges    │  │   paste     │  │ • SEO Editor    │      │
│  └─────────────┘  └─────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
```

### Layer 2: Authentication
```
┌─────────────────────────────────────────────────────────────┐
│                        Clerk Auth                           │
│                                                             │
│  • User sign-up / sign-in                                   │
│  • Session management                                       │
│  • JWT tokens                                               │
│  • User ID passed to Convex                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
```

### Layer 3: Backend API & Database
```
┌─────────────────────────────────────────────────────────────┐
│                      Convex Platform                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Database (contentProjects)             │    │
│  │                                                     │    │
│  │  Fields:                                            │    │
│  │  • userId, inputType, inputContent                  │    │
│  │  • status, jobStatus                                │    │
│  │  • blogPost, socialPosts                            │    │
│  │  • emailNewsletter, seoMetadata                     │    │
│  │  • publishedTo, timestamps                          │    │
│  │                                                     │    │
│  │  Indexes:                                           │    │
│  │  • by_user, by_status, by_user_and_status           │    │  
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌───────────────────┐    ┌─────────────────────────────┐   │
│  │   Queries (Read)  │    │     Mutations (Write)       │   │
│  │                   │    │                             │   │
│  │  • getUserProjects│    │  • createProject            │   │
│  │  • getProject     │    │  • updateProjectStatus      │   │
│  │                   │    │  • updateJobStatus          │   │
│  │                   │    │  • saveBlogPost             │   │
│  │                   │    │  • saveSocialPosts          │   │
│  │                   │    │  • saveEmailNewsletter      │   │
│  │                   │    │  • saveSeoMetadata          │   │
│  │                   │    │  • updatePublishStatus      │   │
│  └───────────────────┘    └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
```

### Layer 4: Workflow Orchestration
```
┌─────────────────────────────────────────────────────────────┐
│                      Inngest Engine                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Content Pipeline Workflow                   │    │
│  │                                                     │    │
│  │  Step 1: Mark status "generating"                   │    │
│  │           │                                         │    │
│  │           ▼                                         │    │
│  │  Step 2: Generate Blog Post                         │    │
│  │           │ (Agent 1 - Sequential)                  │    │
│  │           ▼                                         │    │
│  │     ┌─────┴─────┬─────────────┐                     │    │
│  │     ▼           ▼             ▼                     │    │
│  │  ┌──────┐   ┌──────┐     ┌──────┐                   │    │
│  │  │Social│   │Email │     │ SEO  │                   │    │
│  │  │Posts │   │News  │     │Meta  │                   │    │
│  │  │(Agent│   │(Agent│     │(Agent│                   │    │
│  │  │  2)  │   │  3)  │     │  4)  │                   │    │
│  │  └──────┘   └──────┘     └──────┘                   │    │
│  │     (Parallel Execution - 3x faster)                │    │
│  │                                                     │    │
│  │  Step 4: Mark status "completed"                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Publish Workflow                            │    │
│  │                                                     │    │
│  │  • Fetch project data                               │    │
│  │  • Publish to each platform in parallel             │    │
│  │  • Track success/failure per platform               │    │
│  │  • Update publishedTo array                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
```

### Layer 5: AI Generation
```
┌─────────────────────────────────────────────────────────────┐
│                  Google Gemini 2.0 Flash                    │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Agent 1     │  │ Agent 2     │  │ Agent 3     │          │
│  │ Blog Post   │  │ Social      │  │ Email       │          │
│  │ Generator   │  │ Posts       │  │ Newsletter  │          │
│  │             │  │ Generator   │  │ Writer      │          │
│  │ • 1000+     │  │             │  │             │          │
│  │   words     │  │ • Twitter/X │  │ • Subject   │          │
│  │ • H2        │  │ • LinkedIn  │  │   lines     │          │
│  │   headers   │  │ • Facebook  │  │ • HTML      │          │
│  │ • Markdown  │  │ • Instagram │  │ • Plain     │          │
│  │ • Excerpt   │  │ • Medium    │  │   text      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
│                   ┌──────────────┐                          │
│                   │ Agent 4      │                          │
│                   │ SEO          │                          │
│                   │ Metadata     │                          │
│                   │ Generator    │                          │
│                   │              │                          │
│                   │ • Title      │                          │
│                   │ • Description│                          │
│                   │ • Keywords   │                          │
│                   │ • URL slug   │                          │
│                   └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
```

### Layer 6: Publishing Layer
```
┌─────────────────────────────────────────────────────────────┐
│                    Publishing Targets                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Twitter/ │  │ LinkedIn │  │ Facebook │  │ Instagram│     │
│  │    X     │  │          │  │          │  │          │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │  Medium  │  │  Email   │  │        Resend API        │   │
│  │          │  │          │  │                          │   │
│  └──────────┘  └──────────┘  └──────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Flow 1: Creating New Content
```
User Action                    System Response
─────────────────────────────────────────────────────────
Enter topic/article
        │
        ▼
Click "Generate"
        │
        ├─────────────────────► Create project in Convex
        │                              │
        │                              ▼
        │                       Set status: "draft"
        │                       Initialize jobStatus
        │                              │
        │                              ▼
        │                       Return projectId
        │                              │
        ├─────────────────────► Trigger Inngest event
        │                              │
        │                              ▼
        │                       Start Content Pipeline
        │                              │
        │                              ▼
        ◄────────────────────── Real-time status updates
        │
View dashboard with            UI auto-refreshes as
progress bar                   jobs complete
```

### Flow 2: AI Content Generation (Parallel)
```
Step          │ Time  │ Blog │ Social │ Email │ SEO
─────────────────────────────────────────────────────────
1. Blog Post  │  15s  │  ●   │        │       │
              │       │  ↓   │        │       │
2. Parallel   │  10s  │  ✓   │   ●    │   ●   │   ●
              │       │      │   ●    │   ●   │   ●
              │       │      │   ●    │   ●   │   ●
              │       │      │   ↓    │   ↓   │   ↓
3. Complete   │  ─    │  ✓   │   ✓    │   ✓   │   ✓

Total Time: ~25 seconds (vs ~55 seconds sequential)
```

### Flow 3: Publishing to Platforms
```
User Action              Inngest Workflow             Result
─────────────────────────────────────────────────────────────
Select platforms
       │
       ▼
Click "Publish"
       │
       ├──────────────► Start Publish Workflow
       │                        │
       │         ┌──────────────┼──────────────┐
       │         ▼              ▼              ▼
       │    [Twitter]      [LinkedIn]     [Facebook]
       │         │              │              │
       │         ▼              ▼              ▼
       │    ┌──────┐       ┌──────┐       ┌───────┐
       │    │Success│      │Failed│       │Success│
       │    └──────┘       └──────┘       └───────┘
       │         │              │              │
       │         └──────────────┼──────────────┘
       │                        ▼
       │              Update Convex DB
       │                        │
       ▼                        ▼
Show results            publishedTo: ["twitter",
in UI                     "facebook"]
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, React 19, TypeScript | UI framework |
| Styling | Tailwind CSS v4, shadcn/ui | Styling + Components |
| State | Convex React | Real-time subscriptions |
| Auth | Clerk | User authentication |
| Database | Convex | Real-time data |
| Workflows | Inngest | Background jobs |
| AI | Google Gemini 2.0 Flash | Content generation |
| Email | Resend | Newsletter delivery |

---

## Key Metrics

- **Content Generation Time**: ~25 seconds (4 agents in parallel)
- **Real-time Latency**: <100ms updates
- **Retry Policy**: 3 attempts with exponential backoff
- **Max Concurrent**: Unlimited (serverless)
