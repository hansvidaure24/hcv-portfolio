import fs from "fs";
import path from "path";

export type Project = {
  title: string;
  image: string;
  description: string;
};

export function getProjects(): Project[] {
  const projectsDir = path.join(process.cwd(), "public", "projects");
  const folders = fs.readdirSync(projectsDir).filter((f) =>
    fs.statSync(path.join(projectsDir, f)).isDirectory()
  );

  return folders.map((folder) => {
    // Find the first .txt file in the folder for description
    const files = fs.readdirSync(path.join(projectsDir, folder));
    const txtFile = files.find((f) => f.endsWith(".txt"));
    let description = "";
    if (txtFile) {
      description = fs.readFileSync(path.join(projectsDir, folder, txtFile), "utf-8");
    }
    // Use cover.jpg if it exists, otherwise fallback to first image file
    let image = `/projects/${folder}/cover.jpg`;
    if (!fs.existsSync(path.join(projectsDir, folder, "cover.jpg"))) {
      const imgFile = files.find((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
      if (imgFile) image = `/projects/${folder}/${imgFile}`;
    }
    return {
      title: folder,
      image,
      description,
    };
  });
}