import fs from "node:fs/promises";
import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";
import { Document, MetadataMode, Settings, VectorStoreIndex, } from "llamaindex";
Settings.embedModel = new OllamaEmbedding({
    model: process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text",
});
Settings.llm = new Ollama({
    model: process.env.OLLAMA_CHAT_MODEL ?? "llama3.2",
});
async function main() {
    const path = "node_modules/llamaindex/examples/abramov.txt";
    const fileContent = await fs.readFile(path, "utf-8");
    const document = new Document({ text: fileContent, id_: path });
    const index = await VectorStoreIndex.fromDocuments([document]);
    const queryEngine = index.asQueryEngine();
    const { message, sourceNodes } = await queryEngine.query({ query: "What is the author do in the collage?" });
    console.log(message.content);
    if (sourceNodes) {
        console.log("Source Nodes:");
        sourceNodes.forEach((source, index) => {
            console.log(`\n${index}: Source: ${source.score} 
                - ${source.node.getContent(MetadataMode.NONE)
                .substring(0, 100)}...\n`);
        });
    }
}
main().catch((error) => {
    console.error("Error:", error);
});
