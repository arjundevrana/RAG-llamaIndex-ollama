import { Router } from "express";
import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";
import { PDFReader } from "@llamaindex/readers/pdf";
import { Settings, VectorStoreIndex, } from "llamaindex";
import path from "node:path";
Settings.embedModel = new OllamaEmbedding({
    model: process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text",
});
Settings.llm = new Ollama({
    model: process.env.OLLAMA_CHAT_MODEL ?? "llama3.2",
});
const routes = Router();
routes.post("/", async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const { query } = req.body;
        const filePath = path.resolve(__dirname, "../../data/THE-INTELLIGENT-INVESTOR.pdf");
        if (!query) {
            return res.status(400).json({ error: "Missing queryin request body" });
        }
        console.log("Received query:", query);
        const reader = new PDFReader();
        const documents = await reader.loadData(filePath);
        const index = await VectorStoreIndex.fromDocuments(documents);
        console.log("Index created successfully.", index);
        if (!index) {
            return res.status(400).json({ error: "Failed to create index" });
        }
        const queryEngine = index.asQueryEngine();
        try {
            console.log("Querying the index.......");
            const queryResult = await queryEngine.query({
                query: query || 'Explain the book in 500–800 words.'
            });
            console.log("Query Result:", queryResult.message.content);
            res.json({ result: queryResult.message.content });
        }
        catch (error) {
            console.error("Error querying the index:", error);
            res.status(500).json({ error: "Error querying the index" });
        }
    }
    catch (error) {
        console.error("Error processing query:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export default routes;
