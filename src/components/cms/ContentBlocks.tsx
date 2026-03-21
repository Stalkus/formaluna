type Block = Record<string, unknown>;

function isBlock(x: unknown): x is Block {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function BlockView({ block, index }: { block: unknown; index: number }) {
  if (!isBlock(block)) {
    return (
      <pre key={index} className="cms-block cms-block--raw">
        {JSON.stringify(block, null, 2)}
      </pre>
    );
  }

  const type = typeof block.type === 'string' ? block.type : 'unknown';

  switch (type) {
    case 'paragraph': {
      const text = typeof block.text === 'string' ? block.text : '';
      return (
        <p key={index} className="cms-block cms-p">
          {text}
        </p>
      );
    }
    case 'heading': {
      const text = typeof block.text === 'string' ? block.text : '';
      const levelRaw = typeof block.level === 'number' ? block.level : 2;
      const level = Math.min(3, Math.max(1, levelRaw));
      const cls = `cms-block cms-h cms-h${level}`;
      if (level === 1) {
        return (
          <h1 key={index} className={cls}>
            {text}
          </h1>
        );
      }
      if (level === 3) {
        return (
          <h3 key={index} className={cls}>
            {text}
          </h3>
        );
      }
      return (
        <h2 key={index} className={cls}>
          {text}
        </h2>
      );
    }
    case 'divider':
      return <hr key={index} className="cms-block cms-divider" />;
    case 'image': {
      const src = typeof block.src === 'string' ? block.src : '';
      const alt = typeof block.alt === 'string' ? block.alt : '';
      const caption = typeof block.caption === 'string' ? block.caption : '';
      if (!src) return null;
      return (
        <figure key={index} className="cms-block cms-figure">
          <img src={src} alt={alt} className="cms-img" loading="lazy" />
          {caption ? <figcaption className="cms-caption">{caption}</figcaption> : null}
        </figure>
      );
    }
    case 'bulletList': {
      const items = Array.isArray(block.items) ? block.items : [];
      return (
        <ul key={index} className="cms-block cms-ul">
          {items.map((item, j) => (
            <li key={j}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
          ))}
        </ul>
      );
    }
    default:
      return (
        <pre key={index} className="cms-block cms-block--unknown">
          {JSON.stringify(block, null, 2)}
        </pre>
      );
  }
}

export default function ContentBlocks({ contentJson }: { contentJson: unknown }) {
  if (contentJson === null || contentJson === undefined) {
    return <p className="cms-empty">No content yet.</p>;
  }

  if (typeof contentJson !== 'object' || Array.isArray(contentJson)) {
    return <pre className="cms-block cms-block--raw">{JSON.stringify(contentJson, null, 2)}</pre>;
  }

  const blocks = (contentJson as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocks)) {
    return <pre className="cms-block cms-block--raw">{JSON.stringify(contentJson, null, 2)}</pre>;
  }

  if (blocks.length === 0) {
    return <p className="cms-empty">No blocks in this page.</p>;
  }

  return (
    <div className="cms-blocks">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} index={index} />
      ))}
    </div>
  );
}
