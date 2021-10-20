package edu.thss.platform.dao.wfprocess;

import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import org.springframework.transaction.annotation.Transactional;
import edu.thss.platform.domain.wfprocess.BtWfProcessDO;
import org.springframework.stereotype.Service;

@Service
public class BtWfProcessDao {

    public BtWfProcessDao() { }

    @PersistenceContext
    private EntityManager em;

    public List<BtWfProcessDO> nqueryAll() throws Exception {
        Query query = em.createNativeQuery("select * from plt_bt_wfprocess", BtWfProcessDO.class);
        List<BtWfProcessDO> result = query.getResultList();
        return result;
    }

    public List<BtWfProcessDO> nqueryAll(String fk_parent, String fk_owner) throws Exception {
        Query query = em.createNativeQuery("select * from plt_bt_wfprocess where Fk_Parent = '" + fk_parent + "' and Fk_Owner = '" + fk_owner + "'", BtWfProcessDO.class);
        List<BtWfProcessDO> result = query.getResultList();
        return result;
    }

    public List<BtWfProcessDO> nqueryAllOfProprietors(String uid) throws Exception {
        Query query = em.createNativeQuery("select * from plt_bt_wfprocess where (Proprietors like '" + uid + "' or AuthorId = '" + uid + "')", BtWfProcessDO.class);
        List<BtWfProcessDO> result = query.getResultList();
        return result;
    }

    public List<BtWfProcessDO> nqueryByPK(String primaryKey) throws Exception {
        Query query = em.createNativeQuery("select * from plt_bt_wfprocess where Pk_WkProcess = '" + primaryKey + "'", BtWfProcessDO.class);
        List<BtWfProcessDO> result = query.getResultList();
        return result;
    }

    @Transactional
    public BtWfProcessDO ninsert(BtWfProcessDO prDO) throws Exception {
        em.persist(prDO);
        return prDO;
    }

    @Transactional
    public BtWfProcessDO nupdate(BtWfProcessDO prDO) throws Exception {
        em.merge(prDO);
        return prDO;
    }

    @Transactional
    public boolean ndelete(String id){
        BtWfProcessDO prDO = em.find(BtWfProcessDO.class, id);
        em.remove(prDO);
        return true;
    }
}
