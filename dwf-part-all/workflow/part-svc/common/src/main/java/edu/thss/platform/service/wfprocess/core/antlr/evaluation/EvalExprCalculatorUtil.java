package edu.thss.platform.service.wfprocess.core.antlr.evaluation;

import edu.thss.platform.service.wfprocess.core.WorkflowEntity;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;
import edu.thss.platform.service.wfprocess.core.data.NullValue;
import edu.thss.platform.service.wfprocess.core.data.expression.Expression;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;

public class EvalExprCalculatorUtil {
	/**
	 * Get CommonTokenStream from source code
	 */
	public static WorkflowEntity computeValue(Expression rule, WfProcess parent) {
		try {
			if (rule == null)
				return new NullValue();
			if (rule.isConstant()) {
				return rule.evaluteConstant();
			} else if (rule.isNullRule()) {
				return new NullValue();
			}
			// 词法级别的字符流 (before v4.7)
			// ANTLRInputStream in = new ANTLRInputStream(rule.toString());
			// EvaluationExpressionLexer l = new EvaluationExpressionLexer(in);
			CharStream stream = CharStreams.fromString(rule.toString());
			EvaluationExpressionLexer l = new EvaluationExpressionLexer(stream);
			// 语法级别的字符串流
			CommonTokenStream tokens = new CommonTokenStream(l);
			EvaluationExpressionParser parser = new EvaluationExpressionParser(tokens);
			rule.setExceptionString(null);
			ParseTree tree = parser.stmt(); // parse
			EvaluationExpressionVisitor<WorkflowEntity> eval = new EvalExprUtil(rule, parent);
			WorkflowEntity result = eval.visit(tree);
			return result;
		} catch (Exception e) {
			rule.setExceptionString(e.getMessage());
			return null;
		}
	}

}
