import React, { useEffect, useRef } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  SceneLoader,
  PBRMaterial,
  Texture,
  MeshBuilder,
  HDRCubeTexture,
} from "@babylonjs/core";
import "@babylonjs/loaders";

const SplatViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 3,
      8,
      new Vector3(-2, 11.3, -5),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 50;

    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    light.intensity = 0.8;

    const directionalLight = new DirectionalLight(
      "directionalLight",
      new Vector3(1, -1, 0),
      scene
    );
    directionalLight.intensity = 1;

    const hdrTexture = new HDRCubeTexture("./rainforest.hdr", scene, 512);
    scene.environmentTexture = hdrTexture;
    scene.createDefaultSkybox(hdrTexture, true, 1000);

    SceneLoader.ImportMeshAsync("", "./", "steve.splat", scene).then(
      (result) => {
        const monkey = result.meshes[0];
        if (monkey) {
          monkey.position = new Vector3(-2, 11.3, -5);
          monkey.scaling = new Vector3(1, 1, 1);
        } else {
          console.error("Failed to load steve.splat");
        }
      }
    );

    SceneLoader.ImportMeshAsync("", "./", "tree.glb", scene).then((result) => {
      const tree = result.meshes[0];
      if (tree) {
        tree.position = new Vector3(3, 0, 0);
        tree.scaling = new Vector3(2, 2, 2);
      } else {
        console.error("Failed to load tree.glb");
      }
    });

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 100, height: 100, subdivisions: 20 },
      scene
    );

    const pbrMaterial = new PBRMaterial("pbrMaterial", scene);
    pbrMaterial.albedoTexture = new Texture(
      "./brown_mud_leaves_diff_1k.jpg",
      scene
    );
    pbrMaterial.usePhysicalLightFalloff = false;
    pbrMaterial.metallic = 0.1;
    pbrMaterial.roughness = 0.8;
    pbrMaterial.environmentIntensity = 1;

    ground.material = pbrMaterial;

    engine.runRenderLoop(() => scene.render());

    window.addEventListener("resize", () => engine.resize());

    return () => engine.dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="renderCanvas"
      style={{ width: "100%", height: "100vh" }}
    />
  );
};

export default SplatViewer;
