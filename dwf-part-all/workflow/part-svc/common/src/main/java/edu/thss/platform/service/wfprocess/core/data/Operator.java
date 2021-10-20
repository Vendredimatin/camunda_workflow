/**
 * 
 */
package edu.thss.platform.service.wfprocess.core.data;

import edu.thss.platform.service.wfprocess.core.WorkflowEntity;

/**
 * @author dcao
 * 
 */
public class Operator extends WorkflowEntity {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -6909251772687414001L;
	private String symbol = null;

	/**
	 * 
	 */
	public Operator() {
	}

	/**
	 * 
	 */
	public Operator(String operator) {
		this();
		setId(operator);
		setName(operator);
		setSymbol(operator);
	}

	public Object clone() {
		Operator op = new Operator(this.symbol);
		return op;
	}

	public String toExpressionString() {
		return toString();
	}

	public String toString() {
		return getSymbol();
	}

	/**
	 * @return the symbol
	 */
	public String getSymbol() {
		return symbol;
	}

	/**
	 * @param symbol
	 *            the symbol to set
	 */
	public void setSymbol(String symbol) {
		this.symbol = symbol;
	}

}
