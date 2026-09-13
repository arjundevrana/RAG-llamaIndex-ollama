import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";
import { PDFReader } from "@llamaindex/readers/pdf";
import {
    Settings,
    VectorStoreIndex,
} from "llamaindex";

Settings.embedModel = new OllamaEmbedding({
    model: process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text",
});
Settings.llm = new Ollama({
    model: process.env.OLLAMA_CHAT_MODEL ?? "llama3.2",
});

async function main() {
    const directory="data/THE-INTELLIGENT-INVESTOR.pdf";
    const reader = new PDFReader();
    const documents = await reader.loadData(directory);
    const index= await VectorStoreIndex.fromDocuments(documents);
    console.log("Index created successfully.",index);

    const queryEngine = index.asQueryEngine({
        similarityTopK: 2,
    });
    console.log("Querying the index.");
    const queryResult = await queryEngine.query({
        query:'Convert the book into actionable steps.Create:' 
        +'-book Name'
        +'-Author Name'
        +'-Explain the book in 500–800 words.'
        +'-What is the central message?'
        +'-What problem is the author trying to solve?'
        +'-Who should read this book and why?'
        +'-Daily actions'
        +'-Weekly actions'
        +'-Monthly actions'
        +'-Habits to develop'
        +'-Mistakes to avoid'
        +'-A 30-day implementation plan'
    });
    console.log("Query Result:", queryResult.message.content);
    
}

main().catch((error) => {
    console.error("Error:", error);
});