/* ============================================================================
   SOFTWARE & MODEL CATALOG — DATA
   ----------------------------------------------------------------------------
   This is the ONLY file you edit to add / update entries.

   To add an item, copy a block and fill it in:
     {
       name: "Tool Name",
       url:  "https://example.com",
       desc: "3-4 sentences max. What it is and why it matters.",
       tags: ["optional", "keywords"],     // used by search, optional
       also: ["Other Category Name"],      // cross-list into more categories
     }

   RANKING: within each category, list the most popular / most widely used
   FIRST. The renderer numbers them top-to-bottom automatically.

   CROSS-LISTING: an item's `also: [...]` makes it appear in those categories
   too, without you copying it. The category names must match a `title` below.
   ============================================================================ */

const CATALOG = {
  updated: "2026-06-30",

  categories: [

    /* ====================================================================== */
    {
      title: "Frontier LLMs — Anthropic",
      blurb: "Claude family models. Strong reasoning, long context, agentic + coding workloads.",
      items: [
        { name: "Claude Opus 4.x", url: "https://www.anthropic.com/claude", desc: "Anthropic's most capable model line, tuned for deep reasoning, long-horizon agentic work, and complex coding. Powers Claude Code and the Claude apps. Large context window with strong tool-use and instruction following. The default choice when quality matters more than cost." },
        { name: "Claude Sonnet 4.x / 5", url: "https://www.anthropic.com/claude", desc: "The balanced workhorse: most of Opus's quality at a fraction of the latency and price. Best general-purpose pick for production apps, chat, and high-volume coding. Excellent at tool use and structured output." },
        { name: "Claude Haiku 4.5", url: "https://www.anthropic.com/claude", desc: "Fast, cheap, small-but-sharp model for classification, extraction, routing, and high-throughput tasks. Ideal when you need many calls or low latency. Surprisingly strong for its size." },
        { name: "Claude API (Anthropic)", url: "https://docs.anthropic.com/", desc: "The developer API behind every Claude model. Supports streaming, tool use, prompt caching, the Messages API, and MCP. The integration point for anything that 'connects to Claude.'", tags: ["api", "sdk"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Frontier LLMs — OpenAI",
      blurb: "GPT family and OpenAI's developer platform.",
      items: [
        { name: "GPT-5 / GPT-4.1", url: "https://openai.com/", desc: "OpenAI's flagship general-purpose models, widely used for chat, coding, and agents. Broad ecosystem support and tooling. The most common 'default' API for many third-party apps." },
        { name: "GPT-4o / o-series (reasoning)", url: "https://openai.com/", desc: "Multimodal (text/vision/audio) and dedicated reasoning models for harder, multi-step problems. The o-series trades speed for stronger chain-of-thought. Popular for math, planning, and analysis." },
        { name: "OpenAI API / Platform", url: "https://platform.openai.com/", desc: "The developer surface for all GPT models, including the Assistants API, Realtime API, and function calling. Huge SDK and community support. The endpoint most 'AI apps' target first.", tags: ["api", "sdk"] },
        { name: "ChatGPT", url: "https://chatgpt.com/", desc: "The consumer chat app that put LLMs mainstream. Includes web browsing, code interpreter, custom GPTs, and voice. The reference point most people mean by 'an AI chatbot.'", also: ["Chat & Assistant Apps"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Frontier LLMs — Google",
      blurb: "Gemini family and Google AI developer tools.",
      items: [
        { name: "Gemini 2.x Pro", url: "https://deepmind.google/technologies/gemini/", desc: "Google's flagship multimodal model with very long context and strong reasoning. Tightly integrated with Google Workspace and Cloud. Competitive with the top Claude/GPT tiers." },
        { name: "Gemini Flash", url: "https://deepmind.google/technologies/gemini/", desc: "The fast, cost-efficient Gemini tier for high-volume and latency-sensitive tasks. Good multimodal support. Google's answer to Haiku/GPT-mini." },
        { name: "Google AI Studio / Gemini API", url: "https://ai.google.dev/", desc: "Free-to-start developer playground and API for Gemini models. Easy prototyping with generous limits. The integration point for anything 'connecting to Gemini.'", tags: ["api", "sdk"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Frontier LLMs — xAI (Grok)",
      blurb: "Grok models and the xAI platform.",
      items: [
        { name: "Grok 4", url: "https://x.ai/", desc: "xAI's flagship model, with real-time access to X (Twitter) data and a less-filtered personality. Strong on current events and reasoning. Available in the X app and via API." },
        { name: "xAI API", url: "https://docs.x.ai/", desc: "Developer API for Grok models, OpenAI-compatible in many ways for easy migration. The integration point for anything 'connecting to Grok.'", tags: ["api", "sdk"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Locally-Run LLMs & Runtimes",
      blurb: "Run models on your own hardware — private, offline-capable, no per-token cost.",
      items: [
        { name: "Ollama", url: "https://ollama.com/", desc: "The most popular way to run open LLMs locally. One-command pulls of Llama, Mistral, Qwen, Gemma and more, with a clean REST API on localhost. Cross-platform and the de-facto backend for dozens of local-AI apps." },
        { name: "LM Studio", url: "https://lmstudio.ai/", desc: "Polished desktop GUI for discovering, downloading, and chatting with local models. Includes a built-in OpenAI-compatible server so other apps can connect. Great for non-CLI users who want local inference." },
        { name: "AnythingLLM", url: "https://anythingllm.com/", desc: "All-in-one local app for chat + RAG over your own documents, with workspaces and agents. Connects to Ollama, LM Studio, or cloud APIs. Popular self-hosted 'private ChatGPT' replacement.", also: ["Self-Hosted Apps (Docker)"] },
        { name: "Jan", url: "https://jan.ai/", desc: "Open-source, offline ChatGPT alternative that runs models locally with a clean UI. Privacy-focused and extensible. A lighter-weight desktop option." },
        { name: "GPT4All", url: "https://www.nomic.ai/gpt4all", desc: "Free desktop app (Nomic) for running open models locally, including on modest hardware. Includes local document chat. One of the earliest mainstream local runners." },
        { name: "llama.cpp", url: "https://github.com/ggml-org/llama.cpp", desc: "The C/C++ inference engine that powers most local-LLM tooling, including Ollama. Runs GGUF-quantized models efficiently on CPU and GPU. The low-level foundation of the local-AI ecosystem.", also: ["GitHub — Notable Repos"] },
        { name: "vLLM", url: "https://github.com/vllm-project/vllm", desc: "High-throughput inference/serving engine for production self-hosting of open models. Used to stand up scalable OpenAI-compatible endpoints. The serious-deployment choice.", also: ["GitHub — Notable Repos"] },
        /* NOTE: you mentioned "Nabicus" — I couldn't confirm a tool by that name.
           If you meant something specific (Nexus? a typo?), tell me and I'll add it. */
      ],
    },

    /* ====================================================================== */
    {
      title: "Chat & Assistant Apps",
      blurb: "Front-end apps that talk to one or more of the big models.",
      items: [
        { name: "ChatGPT", url: "https://chatgpt.com/", desc: "OpenAI's consumer app — web, mobile, desktop, voice, and custom GPTs. The most widely used AI assistant. Backed by GPT models." },
        { name: "Claude (web / desktop / mobile)", url: "https://claude.ai/", desc: "Anthropic's assistant app with Projects, artifacts, and file analysis. Strong for writing, analysis, and coding. Backed by Claude models." },
        { name: "Google Gemini app", url: "https://gemini.google.com/", desc: "Google's assistant, integrated across Android, Chrome, and Workspace. Multimodal with deep Google-services tie-ins." },
        { name: "Grok (in X)", url: "https://x.ai/", desc: "xAI's assistant inside the X app and standalone, with real-time social data. Distinct, less-filtered tone." },
        { name: "Perplexity", url: "https://www.perplexity.ai/", desc: "AI answer engine that cites live web sources, letting you pick the underlying model. Excellent for research and fact-checking. Connects to multiple frontier providers.", tags: ["search", "research"] },
        { name: "Microsoft Copilot", url: "https://copilot.microsoft.com/", desc: "Microsoft's assistant embedded across Windows, Edge, and Microsoft 365. Built largely on OpenAI models. Ubiquitous for office workflows." },
        { name: "Poe", url: "https://poe.com/", desc: "Quora's multi-model aggregator — one app, many bots (Claude, GPT, Gemini, and more). Good for comparing models side by side." },
        { name: "T3 Chat", url: "https://t3.chat/", desc: "Fast, developer-favorite multi-model chat UI with bring-your-own-key support. Lightweight and quick. Popular in the dev community." },
        { name: "Open WebUI", url: "https://openwebui.com/", desc: "Self-hosted, feature-rich chat UI that front-ends Ollama and any OpenAI-compatible API. The go-to open-source ChatGPT-style interface for local setups.", also: ["Self-Hosted Apps (Docker)", "Locally-Run LLMs & Runtimes"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "AI Coding Tools",
      blurb: "Editors, CLIs, and agents that write and edit code with you.",
      items: [
        { name: "Claude Code", url: "https://claude.com/claude-code", desc: "Anthropic's agentic coding tool in the terminal, IDE, and web. Reads/edits your repo, runs commands, and drives multi-step tasks. Backed by Claude models." },
        { name: "Cursor", url: "https://cursor.com/", desc: "AI-first code editor (VS Code fork) with deep in-line completion and chat. Lets you pick among frontier models. One of the most popular AI IDEs." },
        { name: "GitHub Copilot", url: "https://github.com/features/copilot", desc: "The original mainstream AI pair-programmer, integrated into VS Code, JetBrains, and more. Inline completions plus chat and agents. Backed by OpenAI and other models.", also: ["GitHub — Notable Repos"] },
        { name: "Windsurf", url: "https://windsurf.com/", desc: "Agentic AI editor with an 'flows' approach to multi-file changes. Competes directly with Cursor. Multi-model support." },
        { name: "Cline", url: "https://github.com/cline/cline", desc: "Open-source autonomous coding agent as a VS Code extension. Bring your own API key (Claude, GPT, local). Popular free alternative.", also: ["GitHub — Notable Repos"] },
        { name: "Aider", url: "https://aider.chat/", desc: "Terminal-based AI pair programmer that works directly with git. Model-agnostic and scriptable. A favorite for CLI-driven workflows." },
        { name: "Codex CLI", url: "https://openai.com/", desc: "OpenAI's agentic coding CLI for terminal-driven development. Runs and edits code with GPT models." },
      ],
    },

    /* ====================================================================== */
    {
      title: "AI Agents & Agent Frameworks",
      blurb: "Autonomous and semi-autonomous agents, plus the frameworks to build them. (Includes your AgentOS fleet.)",
      items: [
        { name: "OpenClaw", url: "#", desc: "[AgentOS] Your research/automation agent platform. Different versions target different capability tiers and tool access — each version's exact scope and permissions differ, so document the version you're running. Connects into the AgentOS Mission Control dashboard.", tags: ["agentos", "internal"] },
        { name: "Hermes", url: "#", desc: "[AgentOS] Messaging-focused agent in the AgentOS fleet, wired to the Hermes panel (and the Boba pet) in Mission Control. Handles communication/notification workflows.", tags: ["agentos", "internal"] },
        { name: "Paperclip", url: "#", desc: "[AgentOS] Autonomous 'core' agent in the fleet. Standby/autonomous operation profile within Mission Control.", tags: ["agentos", "internal"] },
        { name: "Nexus", url: "#", desc: "[AgentOS] Orchestrator-type agent that coordinates other agents in the fleet. Core role within Mission Control.", tags: ["agentos", "internal"] },
        { name: "Phantom", url: "#", desc: "[AgentOS] Stealth-profile agent in the fleet. Currently an offline/standby core agent in Mission Control.", tags: ["agentos", "internal"] },
        { name: "LangChain / LangGraph", url: "https://www.langchain.com/", desc: "The most widely used framework for building LLM apps and stateful agent graphs. Huge ecosystem of integrations. The default starting point for many agent builders.", also: ["GitHub — Notable Repos"] },
        { name: "Model Context Protocol (MCP)", url: "https://modelcontextprotocol.io/", desc: "Open standard (from Anthropic) for connecting models to tools, data, and apps. Rapidly becoming the universal plug for agent tooling. Supported by Claude, and a growing list of clients.", tags: ["protocol", "standard"] },
        { name: "AutoGPT", url: "https://github.com/Significant-Gravitas/AutoGPT", desc: "The repo that popularized autonomous goal-driven agents. Spawns and chains its own subtasks. Historically important and still widely referenced.", also: ["GitHub — Notable Repos"] },
        { name: "CrewAI", url: "https://www.crewai.com/", desc: "Framework for orchestrating multiple role-playing agents that collaborate on a task. Clean abstractions for 'crews.' Popular for multi-agent workflows." },
        { name: "AutoGen", url: "https://github.com/microsoft/autogen", desc: "Microsoft's framework for multi-agent conversation and orchestration. Strong research backing. Good for complex agent topologies.", also: ["GitHub — Notable Repos"] },
        { name: "n8n", url: "https://n8n.io/", desc: "Fair-code workflow automation with first-class AI/agent nodes. Self-hostable and visual. Bridges classic automation and LLM agents.", also: ["Self-Hosted Apps (Docker)"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Web Scrapers & Data Extraction",
      blurb: "Tools to pull structured data off the web — best/most-maintained first.",
      items: [
        { name: "Firecrawl", url: "https://www.firecrawl.dev/", desc: "Turns websites into clean, LLM-ready markdown/JSON via a simple API. Handles crawling, JS rendering, and extraction. Hugely popular for feeding RAG and agents.", tags: ["llm", "api"] },
        { name: "Playwright", url: "https://playwright.dev/", desc: "Microsoft's cross-browser automation library — reliable for scraping JS-heavy sites and end-to-end testing. Multi-language. The modern default for browser automation.", also: ["GitHub — Notable Repos"] },
        { name: "Scrapy", url: "https://scrapy.org/", desc: "Mature, high-performance Python framework for large-scale crawling. Built-in pipelines, throttling, and exporters. The workhorse for serious scraping projects." },
        { name: "Crawl4AI", url: "https://github.com/unclecode/crawl4ai", desc: "Open-source crawler purpose-built to produce clean output for LLMs. Fast and async. A free Firecrawl-style alternative.", also: ["GitHub — Notable Repos"] },
        { name: "Puppeteer", url: "https://pptr.dev/", desc: "Google's headless-Chrome automation library (Node). Long-established for scraping and PDF/screenshot generation. Slightly Chrome-centric vs Playwright." },
        { name: "Beautiful Soup", url: "https://www.crummy.com/software/BeautifulSoup/", desc: "The classic Python HTML/XML parser for quick, simple extraction. No browser needed. Perfect for static pages and beginners." },
        { name: "Apify", url: "https://apify.com/", desc: "Cloud platform + marketplace of ready-made scrapers ('Actors'). Handles proxies and scaling for you. Good when you'd rather rent than build." },
      ],
    },

    /* ====================================================================== */
    {
      title: "Docker & Containers",
      blurb: "The container platform and the core tooling around it.",
      items: [
        { name: "Docker", url: "https://www.docker.com/", desc: "The standard for packaging apps into portable containers. Docker Desktop + Engine + Compose cover local dev to production. The backbone of modern self-hosting and deployment.", tags: ["containers"] },
        { name: "Docker Compose", url: "https://docs.docker.com/compose/", desc: "Define and run multi-container apps from a single YAML file. The easiest way to spin up self-hosted stacks. Ubiquitous in homelab and dev setups." },
        { name: "Portainer", url: "https://www.portainer.io/", desc: "Web UI for managing Docker (and Kubernetes) — containers, images, volumes, stacks. Makes container management approachable. A homelab staple.", also: ["Self-Hosted Apps (Docker)"] },
        { name: "Kubernetes", url: "https://kubernetes.io/", desc: "The dominant container orchestrator for scaling and managing workloads across clusters. Powerful but complex. The production standard beyond single hosts.", also: ["GitHub — Notable Repos"] },
        { name: "Podman", url: "https://podman.io/", desc: "Daemonless, rootless container engine that's largely Docker-CLI compatible. A security-focused drop-in alternative. Popular in enterprise/Red Hat environments." },
      ],
    },

    /* ====================================================================== */
    {
      title: "Self-Hosted Apps (Docker)",
      blurb: "Popular FOSS apps you run in containers — media, files, dashboards, automation.",
      items: [
        { name: "Home Assistant", url: "https://www.home-assistant.io/", desc: "The leading open-source home-automation platform. Local-first control of thousands of smart devices. The crown jewel of most homelabs." },
        { name: "Immich", url: "https://immich.app/", desc: "Self-hosted Google Photos alternative with AI search, face recognition, and mobile backup. Fast-moving and beloved. The current darling of self-hosting." },
        { name: "Nextcloud", url: "https://nextcloud.com/", desc: "Self-hosted file sync, sharing, and collaboration suite (docs, calendar, contacts). Your own Google Drive/Office. A self-hosting cornerstone." },
        { name: "Jellyfin", url: "https://jellyfin.org/", desc: "Free, fully open media server for movies, TV, and music. No subscriptions or phone-home. The FOSS alternative to Plex." },
        { name: "Paperless-ngx", url: "https://docs.paperless-ngx.com/", desc: "Scan, OCR, index, and search all your documents. Goes fully paperless with tags and full-text search. A favorite for digital filing." },
        { name: "Vaultwarden", url: "https://github.com/dani-garcia/vaultwarden", desc: "Lightweight, self-hosted Bitwarden-compatible password manager server. Runs in a tiny container. Popular for owning your own vault.", also: ["GitHub — Notable Repos"] },
        { name: "Pi-hole", url: "https://pi-hole.net/", desc: "Network-wide ad and tracker blocking via DNS. Runs on a Raspberry Pi or any container. A near-universal homelab install." },
        { name: "Uptime Kuma", url: "https://github.com/louislam/uptime-kuma", desc: "Self-hosted uptime/status monitoring with a clean UI and rich notifications. Watches your services and pings you on failure. Simple and widely loved.", also: ["GitHub — Notable Repos"] },
        { name: "Grafana", url: "https://grafana.com/", desc: "The standard dashboarding/visualization layer for metrics and logs. Pairs with Prometheus/Loki. Everywhere in monitoring stacks." },
        { name: "Traefik", url: "https://traefik.io/", desc: "Modern reverse proxy and load balancer with automatic HTTPS and service discovery. Great for routing many containerized apps. A homelab/edge favorite." },
      ],
    },

    /* ====================================================================== */
    {
      title: "GitHub — Notable Repos",
      blurb: "Famous, high-impact open-source projects (by stars/influence).",
      items: [
        { name: "freeCodeCamp", url: "https://github.com/freeCodeCamp/freeCodeCamp", desc: "One of the most-starred repos on GitHub — a full free curriculum for learning to code. Millions of learners. The reference open-education project." },
        { name: "Linux kernel", url: "https://github.com/torvalds/linux", desc: "The kernel that runs most of the world's servers, phones, and devices. The definitive large-scale open-source project. Mirrored on GitHub." },
        { name: "VS Code", url: "https://github.com/microsoft/vscode", desc: "Microsoft's open-source editor that became the industry default. Massive extension ecosystem. The base for many AI editors." },
        { name: "React", url: "https://github.com/facebook/react", desc: "Meta's UI library that defined modern component-based front-end development. Enormous ecosystem. Powers a huge share of the web." },
        { name: "TensorFlow", url: "https://github.com/tensorflow/tensorflow", desc: "Google's foundational machine-learning framework. Production-grade and broadly adopted. A pillar of the ML world." },
        { name: "Ollama", url: "https://github.com/ollama/ollama", desc: "The local-LLM runner's repo — among the fastest-growing AI projects. See the Locally-Run section for details.", also: ["Locally-Run LLMs & Runtimes"] },
        { name: "n8n", url: "https://github.com/n8n-io/n8n", desc: "Workflow automation with AI nodes; one of the most-starred automation repos. See the Agents section for details." },
        { name: "Awesome (sindresorhus)", url: "https://github.com/sindresorhus/awesome", desc: "The meta-list of 'awesome' curated lists for nearly every topic. A top-starred discovery hub. Where many people start a search." },
        { name: "Public APIs", url: "https://github.com/public-apis/public-apis", desc: "A massive curated directory of free public APIs across categories. Perennial top-trending repo. Great for finding data sources." },
        { name: "build-your-own-x", url: "https://github.com/codecrafters-io/build-your-own-x", desc: "Tutorials for rebuilding well-known tech (databases, git, OSes) from scratch. Beloved for deep learning. Consistently top-starred." },
      ],
    },

  ],
};

if (typeof module !== "undefined") module.exports = CATALOG;
