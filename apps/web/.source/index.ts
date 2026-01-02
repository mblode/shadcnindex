// @ts-nocheck -- skip type checking

import { _runtime } from "fumadocs-mdx/runtime/next";
import * as docs_2 from "../content/docs/(root)/index.mdx?collection=docs";
import * as docs_0 from "../content/docs/components/index.mdx?collection=docs";
import * as docs_1 from "../content/docs/components/item.mdx?collection=docs";
import type * as _source from "../source.config";
export const docs = _runtime.docs<typeof _source.docs>(
  [
    {
      info: {
        path: "components/index.mdx",
        fullPath: "content/docs/components/index.mdx",
      },
      data: docs_0,
    },
    {
      info: {
        path: "components/item.mdx",
        fullPath: "content/docs/components/item.mdx",
      },
      data: docs_1,
    },
    {
      info: {
        path: "(root)/index.mdx",
        fullPath: "content/docs/(root)/index.mdx",
      },
      data: docs_2,
    },
  ],
  [
    {
      info: { path: "meta.json", fullPath: "content/docs/meta.json" },
      data: { pages: ["(root)", "components"], root: true },
    },
    {
      info: {
        path: "components/meta.json",
        fullPath: "content/docs/components/meta.json",
      },
      data: { title: "Components", pages: ["index", "item"] },
    },
    {
      info: {
        path: "(root)/meta.json",
        fullPath: "content/docs/(root)/meta.json",
      },
      data: { title: "Get Started", pages: ["index"] },
    },
  ]
);
