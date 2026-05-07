import { describe, it, expect } from "vitest";
import type { TaskAttachment } from "@/lib/domain/types";

describe("AttachmentViewer", () => {
  it("should handle empty attachments array", () => {
    const attachments: TaskAttachment[] = [];
    expect(attachments.length).toBe(0);
  });

  it("should handle single attachment", () => {
    const attachments: TaskAttachment[] = [
      {
        uri: "file:///path/to/image.jpg",
        type: "image",
        name: "photo.jpg",
      },
    ];
    expect(attachments.length).toBe(1);
    expect(attachments[0].type).toBe("image");
  });

  it("should handle multiple attachments", () => {
    const attachments: TaskAttachment[] = [
      {
        uri: "file:///path/to/image1.jpg",
        type: "image",
        name: "photo1.jpg",
      },
      {
        uri: "file:///path/to/image2.jpg",
        type: "image",
        name: "photo2.jpg",
      },
      {
        uri: "file:///path/to/document.pdf",
        type: "file",
        name: "document.pdf",
      },
    ];
    expect(attachments.length).toBe(3);
    expect(attachments.filter((a) => a.type === "image").length).toBe(2);
    expect(attachments.filter((a) => a.type === "file").length).toBe(1);
  });

  it("should preserve attachment metadata", () => {
    const attachment: TaskAttachment = {
      uri: "file:///path/to/image.jpg",
      type: "image",
      name: "my-photo.jpg",
    };
    expect(attachment.uri).toBe("file:///path/to/image.jpg");
    expect(attachment.type).toBe("image");
    expect(attachment.name).toBe("my-photo.jpg");
  });
});
