package edu.thss.platform.dao.wfprocess;

import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import org.springframework.transaction.annotation.Transactional;
import edu.thss.platform.domain.wfprocess.IdCacheDO;
import org.springframework.stereotype.Service;

@Service
public class IdCacheDao {

    public IdCacheDao() { }

    @PersistenceContext
    private EntityManager em;

    public String getRuntimeCode() throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) return result.get(0).getRuntimeCode();
        else return "";
    }

    @Transactional
    public void setRuntimeCode(String code) throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) {
            IdCacheDO item = result.get(0);
            item.setRuntimeCode(code);
            em.merge(item);
        }
    }

    public String getBuildtimeCode() throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) return result.get(0).getBuildtimeCode();
        else return "";
    }

    @Transactional
    public void setBuildtimeCode(String code) throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) {
            IdCacheDO item = result.get(0);
            item.setBuildtimeCode(code);
            em.merge(item);
        }
    }

    public String getSerialCode() throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) return result.get(0).getSerialCode();
        else return "";
    }

    @Transactional
    public void setSerialCode(String code) throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) {
            IdCacheDO item = result.get(0);
            item.setSerialCode(code);
            em.merge(item);
        }
    }

    public int getVersionNumber() throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) return result.get(0).getVersionNumber();
        else return 0;
    }

    @Transactional
    public void setVersionNumber(int version) throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) {
            IdCacheDO item = result.get(0);
            item.setVersionNumber(version);
            em.merge(item);
        }
    }

    public int getUniCounting() throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) return result.get(0).getUniCounting();
        else return 0;
    }

    @Transactional
    public void setUniCounting(int version) throws Exception {
        Query query = em.createNativeQuery("select * from plt_idcache", IdCacheDO.class);
        List<IdCacheDO> result = query.getResultList();
        if (result.size() > 0) {
            IdCacheDO item = result.get(0);
            item.setUniCounting(version);
            em.merge(item);
        }
    }
}
