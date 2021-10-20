/**
 * 
 */
package edu.thss.platform.service.wfprocess.core.runtime.util;

import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.Transition;

import java.util.Comparator;

/**
 * @author cdh
 * @version 1.0.0
 */
public class TransitionComparator implements Comparator<Transition> {

	/**
	 * @return a negative integer, zero, or a positive integer as the first
	 *         argument is less than, equal to, or greater than the second.
	 */
	@Override
	public int compare(Transition arg0, Transition arg1) {
		return arg0.getOrderNumber() - arg1.getOrderNumber();
	}

}
