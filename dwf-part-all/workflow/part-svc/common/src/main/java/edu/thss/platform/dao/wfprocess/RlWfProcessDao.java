package edu.thss.platform.dao.wfprocess;

import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import org.springframework.transaction.annotation.Transactional;
import edu.thss.platform.domain.wfprocess.RlWfProcessDO;
import org.springframework.stereotype.Service;

@Service
public class RlWfProcessDao {

    public RlWfProcessDao() { }

    @PersistenceContext
    private EntityManager em;

    public List<RlWfProcessDO> nqueryAll() throws Exception {
        Query query = em.createNativeQuery("select * from plt_rl_wfprocess", RlWfProcessDO.class);
        List<RlWfProcessDO> result = query.getResultList();
        return result;
    }

    public List<RlWfProcessDO> nqueryAll(String fk_parent, String fk_owner) throws Exception {
        Query query = em.createNativeQuery("select * from plt_rl_wfprocess where Fk_Parent = '" + fk_parent + "' and Fk_Owner = '" + fk_owner + "'", RlWfProcessDO.class);
        List<RlWfProcessDO> result = query.getResultList();
        return result;
    }

    public List<RlWfProcessDO> nqueryAllOfProprietors(String uid) throws Exception {
        Query query = em.createNativeQuery("select * from plt_rl_wfprocess where (Proprietors like '" + uid + "' or AuthorId = '" + uid + "')", RlWfProcessDO.class);
        List<RlWfProcessDO> result = query.getResultList();
        return result;
    }

    public List<RlWfProcessDO> nqueryByPK(String primaryKey) throws Exception {
        Query query = em.createNativeQuery("select * from plt_rl_wfprocess where Pk_WkProcess = '" + primaryKey + "'", RlWfProcessDO.class);
        List<RlWfProcessDO> result = query.getResultList();
        return result;
    }

    @Transactional
    public RlWfProcessDO ninsert(RlWfProcessDO prDO) throws Exception {
        em.persist(prDO);
        return prDO;
    }

    @Transactional
    public RlWfProcessDO nupdate(RlWfProcessDO prDO) throws Exception {
        em.merge(prDO);
        return prDO;
    }

    @Transactional
    public boolean ndelete(String id){
        RlWfProcessDO prDO = em.find(RlWfProcessDO.class, id);
        em.remove(prDO);
        return true;
    }
}
