import dotenv from 'dotenv';
import { Ollama, OllamaEmbedding } from '@llamaindex/ollama';
import { SimpleDirectoryReader } from '@llamaindex/readers/directory';
import { Settings, VectorStoreIndex } from 'llamaindex';

dotenv.config();

Settings.embedModel = new OllamaEmbedding({
    model: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
});
Settings.llm = new Ollama({
    model: process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2',
});

async function main() {
    const reader = new SimpleDirectoryReader();
    const worddocs = await reader.loadData({ directoryPath: './doc' });

    if (!worddocs.length) {
        throw new Error('No documents were found in ./doc');
    }

    const indexdoc = await VectorStoreIndex.fromDocuments(worddocs);
    const queryEnginedoc = indexdoc.asQueryEngine();
    const resultdoc = await queryEnginedoc.query({
        query: 'What is the main topic of the documents in 2 sentences?',
    });

    console.log('Word Response:', resultdoc.message.content);
    
    const pdfreader = new SimpleDirectoryReader();
    const pdfDocs = await pdfreader.loadData({ directoryPath: './pdf' });

    if (!pdfDocs.length) {
        throw new Error('No documents were found in ./pdf');
    }

    const pdfindex = await VectorStoreIndex.fromDocuments(pdfDocs);
    const queryEngine = pdfindex.asQueryEngine();
    const pdfesult = await queryEngine.query({
        query: 'What is the main topic of the documents in 2 sentences?',
    });

    console.log('PDF Response:', pdfesult.message.content);
    
}

main().catch((err) => {
    console.error('Error:', err);
});
