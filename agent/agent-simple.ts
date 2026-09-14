import path from 'node:path';
import dotenv from 'dotenv';
import { Ollama, OllamaEmbedding } from '@llamaindex/ollama';
import { SimpleDirectoryReader } from '@llamaindex/readers/directory';
import { RouterQueryEngine, Settings, VectorStoreIndex } from 'llamaindex';

dotenv.config();

const baseDir = __dirname;
const resolveDataDir = (folder: string) => {
    const absolutePath = path.join(baseDir, folder);
    return path.resolve(absolutePath);
};

Settings.embedModel = new OllamaEmbedding({
    model: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
});
Settings.llm = new Ollama({
    model: process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2',
});

async function main() {
    const reader = new SimpleDirectoryReader();
    const docDir = resolveDataDir('doc');
    const wordDocs = await reader.loadData({ directoryPath: docDir });

    if (!wordDocs.length) {
        throw new Error(`No documents were found in ${docDir}`);
    }

    const indexDoc = await VectorStoreIndex.fromDocuments(wordDocs);
    const queryEngineDoc = indexDoc.asQueryEngine();
    const resultDoc = await queryEngineDoc.query({
        query: `Identify the 10–20 most important ideas in the entire book.
                For each idea:
                - Explain it simply
                - Explain it technically/deeply
                - Give a real-world example
                - Explain when it is useful
                - Explain its limitations`,
            });

    //console.log('Word Response:', resultDoc.message.content);

    const pdfReader = new SimpleDirectoryReader();
    const pdfDir = resolveDataDir('pdf');
    const pdfDocs = await pdfReader.loadData({ directoryPath: pdfDir });

    if (!pdfDocs.length) {
        throw new Error(`No documents were found in ${pdfDir}`);
    }

    const pdfIndex = await VectorStoreIndex.fromDocuments(pdfDocs);
    const pdfQueryEngine = pdfIndex.asQueryEngine();
    const pdfResult = await pdfQueryEngine.query({
        query: `Identify the 10–20 most important ideas in the entire book.
                For each idea:
                - Explain it simply
                - Explain it technically/deeply
                - Give a real-world example
                - Explain when it is useful
                - Explain its limitations`,
             });

    //console.log('PDF Response:', pdfResult.message.content);

    const routerQueryEngine = RouterQueryEngine.fromDefaults({
        queryEngineTools: [
            {
                queryEngine: queryEngineDoc,
                description: 'Useful for question about the articles on AI'
            },
            {
                queryEngine: pdfQueryEngine,
                description: 'Useful for question about the articles on investment'
            }
        ]
    });

    const routedResult = await routerQueryEngine.query({
        //query: 'Summarize the key investment ideas from both sources.'
        query: 'Summarize the key Artificial Intelligence ideas from both sources.'
    });

    console.log('Router Response:', routedResult.message.content);
}

main().catch((err) => {
    console.error('Error:', err);
});
