import os
import re
from app.db.supabase_client import get_supabase_client
from app.rag.embeddings import get_embedding, get_embeddings_batch

def chunk_text(text: str, max_chars: int = 1500, overlap: int = 200) -> list[str]:
    """
    Split text into chunks of max_chars with an overlap of overlap characters,
    trying to respect paragraph boundaries (double newlines).
    """
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = []
    current_len = 0
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
            
        para_len = len(para)
        # If a single paragraph is larger than the max chunk size, we must split it by words
        if para_len > max_chars:
            # First, flush current chunk if not empty
            if current_chunk:
                chunks.append("\n\n".join(current_chunk))
                current_chunk = []
                current_len = 0
            
            # Split the giant paragraph
            words = para.split(" ")
            sub_chunk = []
            sub_len = 0
            for word in words:
                if sub_len + len(word) + 1 > max_chars:
                    chunks.append(" ".join(sub_chunk))
                    # Retain overlap of words
                    overlap_words = sub_chunk[-max(1, int(overlap / 6)):]
                    sub_chunk = list(overlap_words) + [word]
                    sub_len = sum(len(w) + 1 for w in sub_chunk)
                else:
                    sub_chunk.append(word)
                    sub_len += len(word) + 1
            if sub_chunk:
                chunks.append(" ".join(sub_chunk))
            continue

        if current_len + para_len + 2 > max_chars:
            # Flush current chunk
            chunks.append("\n\n".join(current_chunk))
            
            # Keep overlap: find paragraphs to carry over
            overlap_chunk = []
            overlap_len = 0
            for p in reversed(current_chunk):
                if overlap_len + len(p) + 2 < overlap:
                    overlap_chunk.insert(0, p)
                    overlap_len += len(p) + 2
                else:
                    break
            
            current_chunk = overlap_chunk + [para]
            current_len = sum(len(p) + 2 for p in current_chunk)
        else:
            current_chunk.append(para)
            current_len += para_len + 2
            
    if current_chunk:
        chunks.append("\n\n".join(current_chunk))
        
    return chunks

def ingest_directory():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    kb_path = os.path.abspath(os.path.join(current_dir, "..", "..", "knowledge_base"))
    
    print(f"Scanning knowledge base directory: {kb_path}")
    if not os.path.exists(kb_path):
        print(f"⚠️ Directory {kb_path} does not exist. Creating it.")
        os.makedirs(kb_path)
        return

    supabase = get_supabase_client()
    md_files = [f for f in os.listdir(kb_path) if f.endswith(".md")]
    
    if not md_files:
        print("⚠️ No markdown files found in the knowledge base directory.")
        return

    for filename in md_files:
        filepath = os.path.join(kb_path, filename)
        title = filename.replace(".md", "").replace("_", " ").title()
        
        print(f"Ingesting file: {filename}...")
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        chunks = chunk_text(content)
        print(f"Split {filename} into {len(chunks)} chunks.")
        
        # Clear existing chunks for this file
        try:
            supabase.table("knowledge_documents").delete().eq("source_file", filename).execute()
        except Exception as e:
            print(f"Error deleting old records: {e}")
            # Continue anyway
            
        if not chunks:
            continue
            
        # Generate embeddings in batches to speed up
        print("Generating embeddings...")
        embeddings = get_embeddings_batch(chunks)
        
        records = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            records.append({
                "title": title,
                "source_file": filename,
                "content": chunk,
                "chunk_index": idx,
                "embedding": embedding,
                "metadata": {"file_size": len(content)}
            })
            
        # Bulk insert to Supabase
        print(f"Inserting {len(records)} records into Supabase...")
        try:
            supabase.table("knowledge_documents").insert(records).execute()
            print(f"✅ Successfully ingested {filename}!")
        except Exception as e:
            print(f"❌ Failed to insert records for {filename}: {e}")

if __name__ == "__main__":
    ingest_directory()
