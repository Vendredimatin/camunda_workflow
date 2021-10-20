package edu.thss.platform.service.wfprocess.core.communication;


import edu.thss.platform.service.wfprocess.core.WorkflowEntity;
import edu.thss.platform.service.wfprocess.core.data.FileConstant;

public class Comment extends WorkflowEntity implements Comparable<Comment> {
	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 4960454391975761821L;
	// 一级评论
	private String commentId = null; // 评论ID
	private String senderId = null; // 评论人的id
	private String senderAvatarUrl = null; // 评论人头像url
	private String senderName = null; // 评论人姓名
	private String articleId = null; // 被评论的文章id
	private long sendTime = 0; // 评论的发送时间
	private String contentType = null; // 评论，提交，转发给xxxx
	private String content = null; // 评论内容
	private String messageType = null; // 评论类型 0 图片 ,1 文本
	private long likeNumber = 0; // 点赞数量
	private SecondaryComment[] twoComments = new SecondaryComment[0]; // 二级评论
	private FileConstant[] attachments = new FileConstant[0]; // 二级评论

	public Comment(){}
	public Comment(String senderId,String senderName,String contentType,String content){
		this.senderId = senderId;this.senderName = senderName;
		this.content = content; this.contentType = contentType;
		this.sendTime = System.currentTimeMillis();

	}
	public String getCommentId() {
		return commentId;
	}

	public void setCommentId(String commentId) {
		this.commentId = commentId;
	}

	public String getSenderId() {
		return senderId;
	}

	public void setSenderId(String senderId) {
		this.senderId = senderId;
	}

	public String getSenderAvatarUrl() {
		return senderAvatarUrl;
	}

	public void setSenderAvatarUrl(String senderAvatarUrl) {
		this.senderAvatarUrl = senderAvatarUrl;
	}

	public String getSenderName() {
		return senderName;
	}

	public void setSenderName(String senderName) {
		this.senderName = senderName;
	}

	public String getArticleId() {
		return articleId;
	}

	public void setArticleId(String articleId) {
		this.articleId = articleId;
	}

	public long getSendTime() {
		return sendTime;
	}

	public void setSendTime(long sendTime) {
		this.sendTime = sendTime;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getContentType() { return contentType; }

	public void setContentType(String contentType) { this.contentType = contentType; }

	public String getMessageType() {
		return messageType;
	}

	public void setMessageType(String messageType) {
		this.messageType = messageType;
	}

	public long getLikeNumber() {
		return likeNumber;
	}

	public void setLikeNumber(long likeNumber) {
		this.likeNumber = likeNumber;
	}

	public SecondaryComment[] getTwoComments() {
		return twoComments;
	}

	public void setTwoComments(SecondaryComment[] twoComments) {
		this.twoComments = twoComments;
	}

	public FileConstant[] getAttachments() {
		return attachments;
	}

	public void setAttachments(FileConstant[] attachments) {
		this.attachments = attachments;
	}

	@Override
	public int compareTo(Comment o) {
		if (this.getSendTime() - o.getSendTime() > 0) {
			return 1;
		} else if (this.getSendTime() - o.getSendTime() < 0) {
			return -1;
		}
		return 0;
	}

}
