class Point {
  /**
   * A point.
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * A Y-shape tree formed with a trunk and two branches.
 */
class Tree {
  /**
   * @param {Point} root
   * @param {number} trunkHeight pixels
   * @param {number} branchRatio number between 0 and 1
   * @param {number} branchAngle spread angle in radians
   * @param {number} treeIncline inclination angle in radians
   */
  constructor(root, trunkHeight, branchRatio, branchAngle, treeIncline) {
    this.root = root;
    this.trunkHeight = trunkHeight;
    this.branchRatio = branchRatio;
    this.branchAngle = branchAngle;
    this.treeIncline = treeIncline;
  }

  get p0() {
    return this.root;
  }

  get p1() {
    const a = this.treeIncline - Math.PI / 2;
    const x = Math.cos(a) * this.trunkHeight + this.p0.x;
    const y = Math.sin(a) * this.trunkHeight + this.p0.y;
    return new Point(x, y);
  }

  get p2() {
    const a = this.branchAngle / 2 - this.treeIncline;
    const branchLength = this.trunkHeight * this.branchRatio;
    const x = this.p1.x - Math.sin(a) * branchLength;
    const y = this.p1.y - Math.cos(a) * branchLength;
    return new Point(x, y);
  }

  get p3() {
    const a = this.branchAngle / 2 + this.treeIncline;
    const branchLength = this.trunkHeight * this.branchRatio;
    const x = this.p1.x + Math.sin(a) * branchLength;
    const y = this.p1.y - Math.cos(a) * branchLength;
    return new Point(x, y);
  }
}

/**
 * The specification of the garden.
 */
class GardenSpec {
  constructor() {
    const trunkHeight = Number(document.getElementById('trunk-height').value);
    const branchRatio =  Number(document.getElementById('branch-ratio').value);
    const branchAngle = Math.PI * Number(document.getElementById('branch-angle').value) / 180;

    this.canvas = document.getElementById('canvas');
    this.canvasContext = this.canvas.getContext('2d');

    this.initialTrees = [
      new Tree(
        new Point(this.canvas.width / 2, this.canvas.height * 0.88),
        trunkHeight,
        branchRatio,
        branchAngle,
        0
      ),
    ];
  }
}

/**
 * The director who is responsible for the garden.
 */
class GardenDirector {
  constructor() {
    const spec = new GardenSpec();
    this.canvas = spec.canvas;
    this.canvasContext = spec.canvasContext;
    this.trees = [...spec.initialTrees];
    this.maxTrunkHeight = this.trees[0].trunkHeight * this.trees[0].branchRatio ** 7;
    this.timerId = null;
  }

  /**
   * The work, draw a single tree and plan the next trees.
   */
  work() {
    const tree = this.trees.shift()
    if (!tree || tree.trunkHeight < this.maxTrunkHeight) {
      return;
    }
    this.drawTree(tree);
    this.planNextTrees(tree);
  }

  /**
   * Draw a tree on the canvas.
   * @param {Tree} tree
   */
  drawTree(tree) {
    const ctx = this.canvasContext;
    ctx.beginPath();
    ctx.strokeStyle = '#333344';
    ctx.moveTo(tree.p0.x, tree.p0.y);
    ctx.lineTo(tree.p1.x, tree.p1.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#333344';
    ctx.moveTo(tree.p1.x, tree.p1.y);
    ctx.lineTo(tree.p2.x, tree.p2.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#AA3340';
    ctx.moveTo(tree.p1.x, tree.p1.y);
    ctx.lineTo(tree.p3.x, tree.p3.y);
    ctx.stroke();
  }

  /**
   * Plan the next trees.
   * @param {Tree} sourceTree
   */
  planNextTrees(sourceTree) {
    const root = sourceTree.p1;
    const trunkHeight = sourceTree.trunkHeight * sourceTree.branchRatio;
    const branchRatio = sourceTree.branchRatio;
    const branchAngle = sourceTree.branchAngle;
    const treeInclineLeft = sourceTree.treeIncline - branchAngle / 2;
    const treeInclineRight = sourceTree.treeIncline + branchAngle / 2;
    this.trees.push(
      new Tree(root, trunkHeight, branchRatio, branchAngle, treeInclineLeft),
      new Tree(root, trunkHeight, branchRatio, branchAngle, treeInclineRight)
    );
  }

  /**
   * Director starts the work.
   */
  run() {
    this.timerId = window.setInterval(() => this.work(), 10);
  }

  /**
   * Director cleans the garden and retires.
   */
  retire() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.trees = [];
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

/**
 * Ask the director to start the work.
 */
function start() {
  window.gardenDirector ||= new GardenDirector();
  window.gardenDirector.run();
}

/**
 * Ask the director to stop the work.
 */
function stop() {
  window.gardenDirector?.retire();
  window.gardenDirector = null;
}
