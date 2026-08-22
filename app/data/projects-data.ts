import fs from "fs";
import path from "path";

export type Project = {
  title: string;
  image: string;
  description: string;
  /** Optional video shown in the project detail view instead of the cover image. */
  video?: string;
};

export function getProjects(): Project[] {
  const projectsDir = path.join(process.cwd(), "public", "projects");
  const folders = fs.readdirSync(projectsDir).filter((f) =>
    fs.statSync(path.join(projectsDir, f)).isDirectory()
  );

  return folders.map((folder) => {
    // Use the first text file as the project description.
    const files = fs.readdirSync(path.join(projectsDir, folder));
    const txtFile = files.find((f) => f.endsWith(".txt"));
    let description = "";
    if (txtFile) {
      description = fs.readFileSync(path.join(projectsDir, folder, txtFile), "utf-8");
    }
    // Prefer cover.jpg, then fall back to the first image.
    let image = `/projects/${folder}/cover.jpg`;
    if (!fs.existsSync(path.join(projectsDir, folder, "cover.jpg"))) {
      const imgFile = files.find((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
      if (imgFile) image = `/projects/${folder}/${imgFile}`;
    }
    const videoFile = files.find((f) => /\.(mp4|webm)$/i.test(f));
    const video = videoFile ? `/projects/${folder}/${videoFile}` : undefined;
    return {
      title: folder,
      image,
      description,
      video,
    };
  });
}