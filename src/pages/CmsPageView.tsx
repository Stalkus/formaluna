import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import ContentBlocks from '../components/cms/ContentBlocks';
import { fetchPublicPageBySlug } from '../api/publicApi';
import type { PublicCmsPage } from '../api/publicApi';
import './CmsPageView.css';

const CmsPageView: React.FC = () => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugParam ? decodeURIComponent(slugParam) : '';
  const { pathname } = useLocation();
  const isTrade = pathname.startsWith('/professionals');

  const homeHref = isTrade ? '/professionals/about' : '/projects/projects';
  const listLabel = isTrade ? 'Trade portal' : 'Studio';

  const [page, setPage] = useState<PublicCmsPage | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setError(null);
    fetchPublicPageBySlug(slug)
      .then((p) => {
        if (!cancelled) setPage(p);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setPage(null);
          setError(e instanceof Error ? e.message : 'Failed to load page');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const title = useMemo(() => page?.title ?? '', [page]);

  if (page === undefined) {
    return (
      <div className="page-wrapper container">
        <Navbar />
        <p className="cms-status">Loading…</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="page-wrapper container">
        <Navbar />
        <div className="cms-status cms-status--error">
          <p>{error || 'Page not found.'}</p>
          <Link to={homeHref} className="cms-back-link">
            ← Back to {listLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper container">
      <Navbar />

      <motion.article
        className="cms-page"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
      >
        <header className="cms-header">
          <Link to={homeHref} className="cms-back-link">
            ← Back to {listLabel}
          </Link>
          <h1 className="cms-title">{title}</h1>
        </header>

        <div className="cms-body">
          <ContentBlocks contentJson={page.contentJson} />
        </div>
      </motion.article>
    </div>
  );
};

export default CmsPageView;
