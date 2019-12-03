/**
 * A group of Reforged batches that are going to be rendered together.
 */
export default class ReforgedBatchGroup {
  /**
   * @param {Model} model
   * @param {string} shader
   */
  constructor(model, shader) {
    /** @member {Model} */
    this.model = model;
    /** @member {string} */
    this.shader = shader;
    /** @member {Array<ReforgedBatch>} */
    this.objects = [];
  }

  /**
   * @param {ModelInstance} instance
   */
  render(instance) {
    let textureMapper = instance.textureMapper;
    let boneTexture = instance.boneTexture;
    let model = this.model;
    let batches = model.batches;
    let viewer = model.viewer;
    let gl = viewer.gl;
    let textures = model.textures;
    let teamColorTextures = model.handler.teamColors;
    let shader = model.handler.hdShader; /// TODO: select the shader.

    shader.use();

    let uniforms = shader.uniforms;

    gl.uniformMatrix4fv(uniforms.u_mvp, false, instance.scene.camera.worldProjectionMatrix);

    boneTexture.bind(15);

    gl.uniform1i(uniforms.u_boneMap, 15);
    gl.uniform1f(uniforms.u_vectorSize, 1 / boneTexture.width);
    gl.uniform1f(uniforms.u_rowSize, 1);

    gl.uniform1i(uniforms.u_diffuseMap, 0);
    gl.uniform1i(uniforms.u_ormMap, 1);
    gl.uniform1i(uniforms.u_teamColorMap, 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.arrayBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.elementBuffer);

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(1);

    for (let index of this.objects) {
      let batch = batches[index];
      let geoset = batch.geoset;
      let material = batch.material;
      let layers = material.layers;
      let diffuseLayer = layers[0];
      let ormLayer = layers[2];
      let layerAlpha = instance.layerAlphas[diffuseLayer.index];

      if (layerAlpha > 0) {
        gl.uniform1f(uniforms.u_layerAlpha, layerAlpha);
        gl.uniform1f(uniforms.u_filterMode, diffuseLayer.filterMode);

        let diffuseTexture = textures[diffuseLayer.textureId];
        let ormTexture = textures[ormLayer.textureId];
        let teamColorTexture = teamColorTextures[instance.teamColor];

        viewer.webgl.bindTexture(textureMapper.get(diffuseTexture) || diffuseTexture, 0);
        viewer.webgl.bindTexture(textureMapper.get(ormTexture) || ormTexture, 1);
        viewer.webgl.bindTexture(textureMapper.get(teamColorTexture) || teamColorTexture, 2);

        geoset.bindHd(shader, diffuseLayer.coordId);
        geoset.render();
      }
    }
  }
}
