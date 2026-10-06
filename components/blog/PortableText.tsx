import { PortableText as BasePortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";

/**
 * Article body styles: a comfortable reading measure (set by the page), 17px
 * Inter at 1.75 line height, Host Grotesk headings, captioned images.
 */
const components = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null;
      return (
        <figure className="my-8">
          <img
            src={urlFor(value).width(1200).url()}
            alt={value.alt || ""}
            loading="lazy"
            className="max-h-[560px] w-full rounded-xl object-cover ring-1 ring-[#EEF2FA]"
          />
          {value.alt && <figcaption className="mt-2 text-sm text-[#7B869C]">{value.alt}</figcaption>}
        </figure>
      );
    },
    code: ({ value }: any) => (
      <pre className="my-6 overflow-x-auto rounded-xl bg-[#0B1B3F] p-4 text-sm text-white">
        <code className={`language-${value.language}`}>{value.code}</code>
      </pre>
    ),
  },
  block: {
    h1: ({ children }: any) => <h2 className="mt-10 font-heading text-2xl font-semibold leading-snug text-[#0B1B3F]">{children}</h2>,
    h2: ({ children }: any) => <h2 className="mt-10 font-heading text-2xl font-semibold leading-snug text-[#0B1B3F]">{children}</h2>,
    h3: ({ children }: any) => <h3 className="mt-8 font-heading text-xl font-semibold leading-snug text-[#0B1B3F]">{children}</h3>,
    h4: ({ children }: any) => <h4 className="mt-6 font-heading text-lg font-semibold text-[#0B1B3F]">{children}</h4>,
    normal: ({ children }: any) => <p className="mt-5 first:mt-0">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="my-6 border-l-[3px] border-[#155DFC] pl-5 text-[#0B1B3F]">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => {
      const external = !String(value?.href ?? "").startsWith("/");
      return (
        <a
          href={value?.href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="font-medium text-[#155DFC] underline decoration-[#155DFC]/30 underline-offset-2 hover:decoration-[#155DFC]"
        >
          {children}
        </a>
      );
    },
    code: ({ children }: any) => <code className="rounded bg-[#EEF3FF] px-1.5 py-0.5 text-[0.9em] text-[#0B1B3F]">{children}</code>,
    strong: ({ children }: any) => <strong className="font-semibold text-[#0B1B3F]">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="mt-5 list-disc space-y-2 pl-6 marker:text-[#155DFC]">{children}</ul>,
    number: ({ children }: any) => <ol className="mt-5 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-[#155DFC]">{children}</ol>,
  },
};

export default function PortableText({ value }: { value: any }) {
  return <BasePortableText value={value} components={components} />;
}
