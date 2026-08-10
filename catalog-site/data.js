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
   too, without you copying it. The category `also` names must match a `title`.

   CAP: keep each category to ~15-20 items max so it stays scannable.
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
        { name: "Claude Code", url: "https://claude.com/claude-code", desc: "Anthropic's agentic coding tool that runs in the terminal, IDE, and web, driven by Claude models. Reads and edits your repo, runs commands, and completes multi-step tasks. The flagship demonstration of Claude's agentic abilities.", also: ["AI Coding Tools"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Frontier LLMs — OpenAI",
      blurb: "GPT family and OpenAI's developer platform.",
      items: [
        { name: "GPT-5 / GPT-4.1", url: "https://openai.com/", desc: "OpenAI's flagship general-purpose models, widely used for chat, coding, and agents. Broad ecosystem support and tooling. The most common 'default' API for many third-party apps." },
        { name: "o-series (reasoning)", url: "https://openai.com/", desc: "Dedicated reasoning models (o3, o4-mini and successors) for harder, multi-step problems. They trade speed for stronger chain-of-thought. Popular for math, planning, science, and analysis." },
        { name: "GPT-4o (omni / multimodal)", url: "https://openai.com/", desc: "Multimodal model handling text, vision, and audio in one. Powers ChatGPT voice and real-time use cases. Fast and broadly capable." },
        { name: "OpenAI API / Platform", url: "https://platform.openai.com/", desc: "The developer surface for all GPT models, including the Responses API, Realtime API, and function calling. Huge SDK and community support. The endpoint most 'AI apps' target first.", tags: ["api", "sdk"] },
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
        { name: "NotebookLM", url: "https://notebooklm.google/", desc: "Gemini-powered research assistant that grounds answers in your own uploaded sources, with the viral 'Audio Overview' podcast feature. Great for studying documents. Cites back to your material." },
      ],
    },

    /* ====================================================================== */
    {
      title: "Frontier LLMs — xAI (Grok)",
      blurb: "Grok models and the xAI platform.",
      items: [
        { name: "Grok 4", url: "https://x.ai/", desc: "xAI's flagship model, with real-time access to X (Twitter) data and a less-filtered personality. Strong on current events and reasoning. Available in the X app and via API." },
        { name: "Grok Mini / Fast", url: "https://x.ai/", desc: "Lower-cost, lower-latency Grok tier for high-throughput use. Trades some quality for speed and price. Good for routing and simple tasks." },
        { name: "xAI API", url: "https://docs.x.ai/", desc: "Developer API for Grok models, largely OpenAI-compatible for easy migration. The integration point for anything 'connecting to Grok.'", tags: ["api", "sdk"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Open-Weight Models",
      blurb: "Downloadable model weights you can run yourself or fine-tune — ranked by adoption.",
      items: [
        { name: "Meta Llama", url: "https://www.llama.com/", desc: "The most widely deployed open-weight family, spanning small to very large sizes. The backbone of most local-AI tooling and a common fine-tuning base. Permissive-ish community license.", also: ["Locally-Run LLMs & Runtimes"] },
        { name: "DeepSeek", url: "https://www.deepseek.com/", desc: "Chinese lab's open models (incl. strong R1-style reasoning) that rival frontier quality at low cost. Caused a major splash for efficient open reasoning. MIT-licensed weights." },
        { name: "Qwen (Alibaba)", url: "https://qwenlm.github.io/", desc: "Fast-moving open family with excellent multilingual, coding, and vision variants. Frequently tops open-model leaderboards. Wide range of sizes." },
        { name: "Mistral", url: "https://mistral.ai/", desc: "European lab known for efficient, high-quality open models and the Mixtral mixture-of-experts line. Strong performance per parameter. Also offers a hosted API." },
        { name: "Google Gemma", url: "https://ai.google.dev/gemma", desc: "Google's lightweight open-weight models derived from Gemini research. Easy to run locally and fine-tune. Good small-model quality." },
        { name: "Microsoft Phi", url: "https://azure.microsoft.com/en-us/products/phi", desc: "Small 'textbook-quality' models that punch far above their size. Ideal for on-device and edge use. Strong reasoning for the footprint." },
        { name: "Hugging Face Hub", url: "https://huggingface.co/", desc: "The central repository for hundreds of thousands of open models, datasets, and demos. Where nearly every open model is published. The GitHub of machine learning.", tags: ["hub", "models"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Locally-Run LLMs & Runtimes",
      blurb: "Run models on your own hardware — private, offline-capable, no per-token cost.",
      items: [
        { name: "Ollama", url: "https://ollama.com/", desc: "The most popular way to run open LLMs locally. One-command pulls of Llama, Mistral, Qwen, Gemma and more, with a clean REST API on localhost. Cross-platform and the de-facto backend for dozens of local-AI apps.", also: ["GitHub — Notable Repos"] },
        { name: "LM Studio", url: "https://lmstudio.ai/", desc: "Polished desktop GUI for discovering, downloading, and chatting with local models. Includes a built-in OpenAI-compatible server so other apps can connect. Great for non-CLI users who want local inference." },
        { name: "llama.cpp", url: "https://github.com/ggml-org/llama.cpp", desc: "The C/C++ inference engine that powers most local-LLM tooling, including Ollama. Runs GGUF-quantized models efficiently on CPU and GPU. The low-level foundation of the local-AI ecosystem.", also: ["GitHub — Notable Repos"] },
        { name: "AnythingLLM", url: "https://anythingllm.com/", desc: "All-in-one local app for chat + RAG over your own documents, with workspaces and agents. Connects to Ollama, LM Studio, or cloud APIs. Popular self-hosted 'private ChatGPT' replacement.", also: ["Self-Hosted Apps (Docker)", "Vector DBs & RAG"] },
        { name: "Open WebUI", url: "https://openwebui.com/", desc: "Self-hosted, feature-rich chat UI that front-ends Ollama and any OpenAI-compatible API. The go-to open-source ChatGPT-style interface for local setups.", also: ["Self-Hosted Apps (Docker)", "Chat & Assistant Apps"] },
        { name: "Jan", url: "https://jan.ai/", desc: "Open-source, offline ChatGPT alternative that runs models locally with a clean UI. Privacy-focused and extensible. A lighter-weight desktop option." },
        { name: "GPT4All", url: "https://www.nomic.ai/gpt4all", desc: "Free desktop app (Nomic) for running open models locally, including on modest hardware. Includes local document chat. One of the earliest mainstream local runners." },
        { name: "vLLM", url: "https://github.com/vllm-project/vllm", desc: "High-throughput inference/serving engine for production self-hosting of open models. Used to stand up scalable OpenAI-compatible endpoints. The serious-deployment choice.", also: ["GitHub — Notable Repos"] },
        { name: "text-generation-webui", url: "https://github.com/oobabooga/text-generation-webui", desc: "The 'oobabooga' all-in-one web UI for running and tinkering with local models across many backends. Power-user friendly with extensions. A long-standing community favorite.", also: ["GitHub — Notable Repos"] },
        { name: "KoboldCpp", url: "https://github.com/LostRuins/koboldcpp", desc: "Single-file local inference app popular for storytelling and roleplay. Easy to run with broad model support. Built on llama.cpp." },
        { name: "LocalAI", url: "https://localai.io/", desc: "Self-hosted, OpenAI-compatible API that runs LLMs, image, and audio models locally. A drop-in replacement endpoint for apps expecting OpenAI. Container-friendly.", also: ["Self-Hosted Apps (Docker)"] },
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
        { name: "Microsoft Copilot", url: "https://copilot.microsoft.com/", desc: "Microsoft's assistant embedded across Windows, Edge, and Microsoft 365. Built largely on OpenAI models. Ubiquitous for office workflows." },
        { name: "Perplexity", url: "https://www.perplexity.ai/", desc: "AI answer engine that cites live web sources, letting you pick the underlying model. Excellent for research and fact-checking. Connects to multiple frontier providers.", tags: ["search", "research"] },
        { name: "Grok (in X)", url: "https://x.ai/", desc: "xAI's assistant inside the X app and standalone, with real-time social data. Distinct, less-filtered tone." },
        { name: "Poe", url: "https://poe.com/", desc: "Quora's multi-model aggregator — one app, many bots (Claude, GPT, Gemini, and more). Good for comparing models side by side." },
        { name: "T3 Chat", url: "https://t3.chat/", desc: "Fast, developer-favorite multi-model chat UI with bring-your-own-key support. Lightweight and quick. Popular in the dev community." },
        { name: "Le Chat (Mistral)", url: "https://chat.mistral.ai/", desc: "Mistral's fast assistant app, including a notably quick 'flash answers' mode. European alternative backed by Mistral models." },
        { name: "DuckDuckGo AI Chat", url: "https://duck.ai/", desc: "Privacy-focused, anonymous access to several models (Claude, GPT, Llama) with no account. Good for quick, throwaway queries. Minimal data retention." },
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
        { name: "Windsurf", url: "https://windsurf.com/", desc: "Agentic AI editor with a 'flows' approach to multi-file changes. Competes directly with Cursor. Multi-model support." },
        { name: "Cline", url: "https://github.com/cline/cline", desc: "Open-source autonomous coding agent as a VS Code extension. Bring your own API key (Claude, GPT, local). Popular free alternative.", also: ["GitHub — Notable Repos", "AI Agents & Agent Frameworks"] },
        { name: "Aider", url: "https://aider.chat/", desc: "Terminal-based AI pair programmer that works directly with git. Model-agnostic and scriptable. A favorite for CLI-driven workflows." },
        { name: "Codex CLI", url: "https://openai.com/", desc: "OpenAI's agentic coding CLI for terminal-driven development. Runs and edits code with GPT models." },
        { name: "Continue", url: "https://www.continue.dev/", desc: "Open-source autopilot extension for VS Code and JetBrains that works with any model, including local ones. Highly customizable. A free Copilot alternative.", also: ["GitHub — Notable Repos"] },
        { name: "Zed", url: "https://zed.dev/", desc: "Blazing-fast, Rust-built collaborative editor with native AI features. Lightweight and multiplayer. A modern, performance-focused IDE." },
        { name: "Roo Code", url: "https://roocode.com/", desc: "Open-source 'autonomous AI dev team' VS Code extension forked from Cline. Multiple agent modes and broad model support. Active community fork." },
        { name: "v0 (Vercel)", url: "https://v0.dev/", desc: "Generative UI tool that produces React/Tailwind components and full pages from prompts. Great for quickly scaffolding front-ends. Tightly tied to the Vercel stack." },
        { name: "bolt.new", url: "https://bolt.new/", desc: "In-browser AI full-stack builder that spins up and runs apps live via WebContainers. Prompt-to-deployed-app fast. Popular for prototypes." },
        { name: "Lovable", url: "https://lovable.dev/", desc: "AI app builder that generates and hosts full-stack web apps from natural language. Aimed at non-developers shipping real products. A leading 'vibe coding' platform." },
        { name: "Mintlify", url: "https://mintlify.com/", desc: "Modern documentation platform for developer products, with AI-powered search, auto-generated API references, and an MCP server for managing docs via agents. Widely adopted by dev-tool companies for clean, fast docs sites." },
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
        { name: "Model Context Protocol (MCP)", url: "https://modelcontextprotocol.io/", desc: "Open standard (from Anthropic) for connecting models to tools, data, and apps. Rapidly becoming the universal plug for agent tooling. Supported by Claude and a growing list of clients.", tags: ["protocol", "standard"] },
        { name: "CrewAI", url: "https://www.crewai.com/", desc: "Framework for orchestrating multiple role-playing agents that collaborate on a task. Clean abstractions for 'crews.' Popular for multi-agent workflows." },
        { name: "AutoGen", url: "https://github.com/microsoft/autogen", desc: "Microsoft's framework for multi-agent conversation and orchestration. Strong research backing. Good for complex agent topologies.", also: ["GitHub — Notable Repos"] },
        { name: "LlamaIndex", url: "https://www.llamaindex.ai/", desc: "Data framework for connecting LLMs and agents to your own data with strong RAG primitives. Complements or competes with LangChain. Widely used for retrieval apps.", also: ["Vector DBs & RAG"] },
        { name: "OpenAI Agents SDK", url: "https://platform.openai.com/docs/guides/agents", desc: "OpenAI's official lightweight framework for building tool-using agents and handoffs. Minimal and production-oriented. The first-party way to build GPT agents.", tags: ["sdk"] },
        { name: "Dify", url: "https://dify.ai/", desc: "Open-source LLM app platform with visual workflows, RAG, and agent building. Self-hostable and team-friendly. A popular low-code AI backend.", also: ["Self-Hosted Apps (Docker)"] },
        { name: "Flowise", url: "https://flowiseai.com/", desc: "Drag-and-drop builder for LLM flows and agents on top of LangChain. Visual and self-hostable. Great for non-coders prototyping pipelines.", also: ["Self-Hosted Apps (Docker)"] },
        { name: "n8n", url: "https://n8n.io/", desc: "Fair-code workflow automation with first-class AI/agent nodes. Self-hostable and visual. Bridges classic automation and LLM agents.", also: ["Self-Hosted Apps (Docker)"] },
        { name: "AutoGPT", url: "https://github.com/Significant-Gravitas/AutoGPT", desc: "The repo that popularized autonomous goal-driven agents. Spawns and chains its own subtasks. Historically important and still widely referenced.", also: ["GitHub — Notable Repos"] },
        { name: "Goose (Block)", url: "https://block.github.io/goose/", desc: "Open-source, on-machine AI agent that uses MCP to run real developer tasks end to end. Extensible and local-first. A rising agentic dev tool." },
        { name: "Polsia", url: "https://polsia.com/", desc: "Autonomous AI platform that runs a company end-to-end — nine specialized agents handle planning, coding, marketing, sales, and customer support 24/7. Positioned as an AI co-founder or CEO agent. Raised $30M at a $250M valuation in May 2026 after growing from $100K to $10M ARR in roughly three months." },
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
        { name: "Selenium", url: "https://www.selenium.dev/", desc: "The long-standing browser-automation standard across many languages. Heavier than Playwright but battle-tested and ubiquitous. Common in legacy and QA pipelines." },
        { name: "Apify", url: "https://apify.com/", desc: "Cloud platform + marketplace of ready-made scrapers ('Actors'). Handles proxies and scaling for you. Good when you'd rather rent than build." },
        { name: "ScrapeGraphAI", url: "https://scrapegraphai.com/", desc: "LLM-driven scraping library where you describe the data you want in plain language. Builds extraction graphs automatically. A newer AI-native approach.", also: ["GitHub — Notable Repos"] },
        { name: "Bright Data", url: "https://brightdata.com/", desc: "Enterprise-grade proxy network and web-data platform for large, hard-to-scrape targets. Handles anti-bot and compliance at scale. The heavy-duty commercial option." },
        { name: "Colly", url: "https://go-colly.org/", desc: "Fast, idiomatic scraping framework for Go. Great throughput with a simple API. The go-to for Go developers." },
      ],
    },

    /* ====================================================================== */
    {
      title: "Image & Video Generation (AI)",
      blurb: "Generate and edit images, video, and 3D from text or references.",
      items: [
        { name: "Midjourney", url: "https://www.midjourney.com/", desc: "The benchmark for high-aesthetic AI image generation. Known for striking, stylized output. Runs via web and Discord." },
        { name: "Stable Diffusion / ComfyUI", url: "https://www.comfy.org/", desc: "The leading open-weight image models, most powerfully driven through the node-based ComfyUI. Fully local, customizable, and free. The foundation of the open image-gen ecosystem.", also: ["Locally-Run LLMs & Runtimes", "GitHub — Notable Repos"] },
        { name: "OpenAI Images (GPT-Image / DALL·E)", url: "https://openai.com/", desc: "OpenAI's image generation, strong at prompt-following and in-image text. Available in ChatGPT and via API. Easy to integrate." },
        { name: "Google Imagen & Veo", url: "https://deepmind.google/technologies/", desc: "Google's photorealistic image (Imagen) and state-of-the-art video (Veo) models. Available in Gemini and Vertex AI. Top-tier video quality." },
        { name: "Sora (OpenAI)", url: "https://openai.com/sora/", desc: "OpenAI's text-to-video model for short, coherent clips. Bundled with ChatGPT plans. A leading consumer video generator." },
        { name: "Black Forest Labs FLUX", url: "https://blackforestlabs.ai/", desc: "High-quality open and commercial image models from the original Stable Diffusion team. Excellent detail and prompt adherence. Widely used in open pipelines." },
        { name: "Runway", url: "https://runwayml.com/", desc: "Pro creative suite for AI video generation and editing. Popular with filmmakers and motion designers. Rich set of video tools." },
        { name: "Leonardo.Ai", url: "https://leonardo.ai/", desc: "Image generation platform aimed at game art, assets, and design with fine-grained control. Friendly UI with many fine-tuned models. Popular with creators." },
        { name: "Adobe Firefly", url: "https://www.adobe.com/products/firefly.html", desc: "Adobe's commercially-safe generative models built into Photoshop and the Creative Cloud. Trained on licensed data. The enterprise-safe choice." },
      ],
    },

    /* ====================================================================== */
    {
      title: "Voice — TTS & Speech-to-Text",
      blurb: "Text-to-speech, voice cloning, and transcription.",
      items: [
        { name: "ElevenLabs", url: "https://elevenlabs.io/", desc: "The leading text-to-speech and voice-cloning platform, prized for natural, expressive voices. Multilingual with an easy API. The default for AI narration and dubbing." },
        { name: "OpenAI Whisper", url: "https://github.com/openai/whisper", desc: "Open-source speech-to-text model with strong multilingual accuracy. Runs locally or via API. The most widely used open transcription model.", also: ["GitHub — Notable Repos"] },
        { name: "Deepgram", url: "https://deepgram.com/", desc: "Fast, accurate real-time speech-to-text API built for developers and call/voice apps. Low latency at scale. A production STT favorite." },
        { name: "whisper.cpp", url: "https://github.com/ggml-org/whisper.cpp", desc: "Efficient C/C++ port of Whisper that runs transcription fully locally, even on modest hardware. From the llama.cpp author. Great for offline, private STT.", also: ["Locally-Run LLMs & Runtimes"] },
        { name: "Coqui / XTTS", url: "https://github.com/coqui-ai/TTS", desc: "Open-source TTS toolkit with multilingual voice cloning (XTTS). Self-hostable and free. A leading open alternative to ElevenLabs." },
        { name: "Kokoro TTS", url: "https://huggingface.co/hexgrad/Kokoro-82M", desc: "Tiny, high-quality open TTS model that runs locally and fast. Punches above its size. Popular for lightweight local voice." },
      ],
    },

    /* ====================================================================== */
    {
      title: "Vector DBs & RAG",
      blurb: "Storage and retrieval layers that give models long-term, searchable memory.",
      items: [
        { name: "Pinecone", url: "https://www.pinecone.io/", desc: "Managed, serverless vector database built for production RAG at scale. No infra to run. A common default for hosted retrieval." },
        { name: "Chroma", url: "https://www.trychroma.com/", desc: "Developer-friendly open-source embedding database, easy to run locally for prototypes. Minimal setup. A popular starting point for RAG.", also: ["GitHub — Notable Repos"] },
        { name: "Qdrant", url: "https://qdrant.tech/", desc: "Fast open-source vector database in Rust with rich filtering. Self-hostable or managed. Strong performance and a homelab favorite.", also: ["Self-Hosted Apps (Docker)"] },
        { name: "Weaviate", url: "https://weaviate.io/", desc: "Open-source vector database with built-in hybrid search and modules. Self-host or cloud. Good for richer semantic apps." },
        { name: "Milvus", url: "https://milvus.io/", desc: "Highly scalable open-source vector database for billion-scale similarity search. Cloud-native architecture. The choice for very large deployments." },
        { name: "pgvector", url: "https://github.com/pgvector/pgvector", desc: "Extension that adds vector search to PostgreSQL, so you can keep embeddings beside your relational data. No new database to operate. Extremely popular for simplicity.", also: ["GitHub — Notable Repos"] },
        { name: "FAISS", url: "https://github.com/facebookresearch/faiss", desc: "Meta's foundational library for efficient similarity search on dense vectors. Embedded, not a server. The engine under many other tools.", also: ["GitHub — Notable Repos"] },
      ],
    },

    /* ====================================================================== */
    {
      title: "Docker & Containers",
      blurb: "The container platform and the core tooling around it.",
      items: [
        { name: "Docker", url: "https://www.docker.com/", desc: "The standard for packaging apps into portable containers. Docker Desktop + Engine + Compose cover local dev to production. The backbone of modern self-hosting and deployment.", tags: ["containers"] },
        { name: "Docker Compose", url: "https://docs.docker.com/compose/", desc: "Define and run multi-container apps from a single YAML file. The easiest way to spin up self-hosted stacks. Ubiquitous in homelab and dev setups." },
        { name: "Docker Hub", url: "https://hub.docker.com/", desc: "The default public registry of prebuilt container images. Where most 'docker pull' images come from. The app store of containers.", tags: ["registry"] },
        { name: "Portainer", url: "https://www.portainer.io/", desc: "Web UI for managing Docker (and Kubernetes) — containers, images, volumes, stacks. Makes container management approachable. A homelab staple.", also: ["Self-Hosted Apps (Docker)"] },
        { name: "Kubernetes", url: "https://kubernetes.io/", desc: "The dominant container orchestrator for scaling and managing workloads across clusters. Powerful but complex. The production standard beyond single hosts.", also: ["GitHub — Notable Repos"] },
        { name: "Podman", url: "https://podman.io/", desc: "Daemonless, rootless container engine that's largely Docker-CLI compatible. A security-focused drop-in alternative. Popular in enterprise/Red Hat environments." },
        { name: "Watchtower", url: "https://containrrr.dev/watchtower/", desc: "Automatically updates running containers when new images are published. Set-and-forget for keeping a homelab current. A common companion service." },
        { name: "Dockge", url: "https://github.com/louislam/dockge", desc: "Modern, lightweight web UI focused on managing Docker Compose stacks. Simpler than Portainer for compose-first setups. By the Uptime Kuma author.", also: ["Self-Hosted Apps (Docker)"] },
        { name: "Rancher", url: "https://www.rancher.com/", desc: "Complete platform for running and managing Kubernetes clusters. Eases multi-cluster operations. Popular in mid-to-large deployments." },
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
        { name: "AdGuard Home", url: "https://adguard.com/en/adguard-home/overview.html", desc: "Network-wide DNS ad/tracker blocker with a polished UI and built-in DoH/DoT. A popular Pi-hole alternative. Easy to configure." },
        { name: "Uptime Kuma", url: "https://github.com/louislam/uptime-kuma", desc: "Self-hosted uptime/status monitoring with a clean UI and rich notifications. Watches your services and pings you on failure. Simple and widely loved.", also: ["GitHub — Notable Repos"] },
        { name: "Grafana", url: "https://grafana.com/", desc: "The standard dashboarding/visualization layer for metrics and logs. Pairs with Prometheus/Loki. Everywhere in monitoring stacks." },
        { name: "Traefik", url: "https://traefik.io/", desc: "Modern reverse proxy and load balancer with automatic HTTPS and service discovery. Great for routing many containerized apps. A homelab/edge favorite." },
        { name: "Nginx Proxy Manager", url: "https://nginxproxymanager.com/", desc: "Friendly web UI for reverse proxying and free SSL certs without editing config files. Beginner-friendly. Extremely common first proxy." },
        { name: "Gitea / Forgejo", url: "https://about.gitea.com/", desc: "Lightweight self-hosted Git forge — your own GitHub. Fast and low-resource. Popular for private repos and CI." },
        { name: "Frigate", url: "https://frigate.video/", desc: "Local, AI-powered NVR with real-time object detection for security cameras. Integrates tightly with Home Assistant. Privacy-respecting surveillance." },
        { name: "Audiobookshelf", url: "https://www.audiobookshelf.org/", desc: "Self-hosted audiobook and podcast server with apps and progress sync. A FOSS Audible alternative. Beloved by listeners." },
        { name: "Karakeep (Hoarder)", url: "https://karakeep.app/", desc: "Self-hosted, AI-tagging bookmark-and-everything hoarder app. Auto-organizes saved links and notes. A rising 'second brain' tool." },
        { name: "Stirling-PDF", url: "https://www.stirlingpdf.com/", desc: "Locally-hosted toolbox for every PDF operation — merge, split, OCR, convert, sign. No data leaves your server. A practical homelab utility." },
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
        { name: "Hugging Face Transformers", url: "https://github.com/huggingface/transformers", desc: "The library that made thousands of pretrained models easy to use in a few lines. The connective tissue of applied ML. Foundational to modern AI work.", also: ["Open-Weight Models"] },
        { name: "TensorFlow", url: "https://github.com/tensorflow/tensorflow", desc: "Google's foundational machine-learning framework. Production-grade and broadly adopted. A pillar of the ML world." },
        { name: "PyTorch", url: "https://github.com/pytorch/pytorch", desc: "Meta's deep-learning framework that became the research and training standard. Most new models are written in it. The default for modern ML." },
        { name: "Ollama", url: "https://github.com/ollama/ollama", desc: "The local-LLM runner's repo — among the fastest-growing AI projects. See the Locally-Run section for details.", also: ["Locally-Run LLMs & Runtimes"] },
        { name: "Stable Diffusion WebUI", url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui", desc: "The repo that made local image generation accessible to everyone. Enormous community and extensions. A landmark generative-AI project.", also: ["Image & Video Generation (AI)"] },
        { name: "developer-roadmap", url: "https://github.com/kamranahmedse/developer-roadmap", desc: "Visual roadmaps for becoming various kinds of developer. One of the most-starred learning resources. A perennial top repo." },
        { name: "Awesome (sindresorhus)", url: "https://github.com/sindresorhus/awesome", desc: "The meta-list of 'awesome' curated lists for nearly every topic. A top-starred discovery hub. Where many people start a search." },
        { name: "Public APIs", url: "https://github.com/public-apis/public-apis", desc: "A massive curated directory of free public APIs across categories. Perennial top-trending repo. Great for finding data sources." },
        { name: "build-your-own-x", url: "https://github.com/codecrafters-io/build-your-own-x", desc: "Tutorials for rebuilding well-known tech (databases, git, OSes) from scratch. Beloved for deep learning. Consistently top-starred." },
        { name: "system-design-primer", url: "https://github.com/donnemartin/system-design-primer", desc: "The go-to open resource for learning system design and prepping for interviews. Clear and comprehensive. A top-starred study repo." },
        { name: "oh-my-zsh", url: "https://github.com/ohmyzsh/ohmyzsh", desc: "The community framework that made a powerful, pretty zsh shell the norm. Huge plugin and theme ecosystem. On countless developer machines." },
      ],
    },

  ],
};

if (typeof module !== "undefined") module.exports = CATALOG;
