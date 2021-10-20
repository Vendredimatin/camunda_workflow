function WfProcessTemplate(){
    this.id = null;
	this.code = null;
	this.name = null;
	this.authorId = null;
	this.author = null;
	this.description = null;
	this.keywords = null;

	this.lastupdate = null;
	// this.parent = null; // folder ID or subprocess point ID
	// this.owner = null; // organization ID
	// this.children = []; // graph nodes.
	this.classtypename = "WfProcess";
	// this.status = 0; // 0: unlocked; 1: locked
	this.bindEnClassName = null;
	// this.proprietors = [];

	this.version = 0;
	this.releaser = null;
	this.releaserId = null;
	this.releaseDate = null;

	this.bpmnXml   = null;
}

export default WfProcessTemplate;