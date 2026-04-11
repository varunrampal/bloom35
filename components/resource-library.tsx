"use client";

import { useDeferredValue, useState } from "react";

import type { ResourceTopic } from "@/lib/app-data";

type ResourceLibraryProps = {
  resources: ResourceTopic[];
};

export function ResourceLibrary({ resources }: ResourceLibraryProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredResources = resources.filter((resource) => {
    if (!deferredQuery) {
      return true;
    }

    const searchText = [
      resource.category,
      resource.readTime,
      resource.summary,
      resource.title,
      ...resource.tags,
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(deferredQuery);
  });

  return (
    <div className="panel library-shell">
      <div className="search-card">
        <p className="eyebrow">Search topics</p>
        <input
          className="search-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sleep, hot flashes, focus, tracking..."
          type="search"
          value={query}
        />
      </div>

      <p className="results-count">
        Showing {filteredResources.length} of {resources.length} resources.
      </p>

      {filteredResources.length > 0 ? (
        <div className="resource-grid">
          {filteredResources.map((resource) => (
            <article className="panel resource-card" id={resource.slug} key={resource.slug}>
              <p className="feature-kicker">{resource.category}</p>
              <h2 className="card-title card-title-lg">{resource.title}</h2>
              <p className="muted">{resource.summary}</p>

              <div className="meta-row">
                <span>{resource.readTime}</span>
                <span>Low-pressure guide</span>
              </div>

              <div className="tag-row">
                {resource.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty-state">
          No matching topics yet. Try a broader term like `sleep`, `mood`, or
          `tracking`.
        </div>
      )}
    </div>
  );
}
