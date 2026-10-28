import { stickerFor, stickerUrl } from './stickers';

// ownersPhoto can be an uploaded data URL, a full https:// link, or a file in public/owners/
// written as "owners/name.jpg".
const photoSrc = (p) => (/^(https?:|data:)/.test(p) ? p : `${import.meta.env.BASE_URL}${p.replace(/^\/+/, '')}`);

// Business details are read-only on the site; owners content is edited directly in Firebase.
export default function BusinessDetail({ business: b, onBack }) {
  const hasStory = b.ownersIntro || b.ownersPhoto || b.ownersCaption;

  return (
    <article className="detail">
      <button className="back" onClick={onBack}>← All businesses</button>

      <header className="detail-head">
        <img className="detail-sticker" src={stickerUrl(stickerFor(b))} alt="" />
        {b.category && <span className="tag">{b.category}</span>}
        <h1>{b.name}</h1>
        {b.address && <p>{b.address}</p>}
        {b.hours && <p className="hours">{b.hours}</p>}
      </header>

      <section className="owners">
        <h2>Meet the Owners</h2>
        {b.ownersIntro?.split('\n').filter(Boolean).map((p, i) => <p key={i} className="intro">{p}</p>)}
        {b.ownersPhoto && <img className="owners-photo" src={photoSrc(b.ownersPhoto)} alt={`The owners of ${b.name}`} />}
        {b.ownersCaption && <p className="caption">{b.ownersCaption}</p>}
        {!hasStory && <p className="intro">This business hasn't shared their story yet.</p>}
      </section>
    </article>
  );
}
