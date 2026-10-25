import { Fragment, ReactNode } from "react";

type Scene = { id: string; node: ReactNode };

/** Renders the page's sections in order; they scroll normally on every screen size. */
export default function SceneStage({ sections }: { sections: Scene[] }) {
  return (
    <>
      {sections.map((s) => (
        <Fragment key={s.id}>{s.node}</Fragment>
      ))}
    </>
  );
}
