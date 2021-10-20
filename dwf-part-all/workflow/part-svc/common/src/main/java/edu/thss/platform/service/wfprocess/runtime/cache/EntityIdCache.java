/**
 * @user Dahai CAO
 * @date 2011-9-11 下午05:44:51
 */
package edu.thss.platform.service.wfprocess.runtime.cache;

import java.util.LinkedList;

public class EntityIdCache extends LinkedList<String> {
	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -7998103311098530994L;

	public synchronized String fetchId() throws InterruptedException {
		while (peek() == null) {
			wait();
		}
		return pop();
	}

	public synchronized void putId(String id) {
		offer(id);
		notifyAll();
	}
	
	

}