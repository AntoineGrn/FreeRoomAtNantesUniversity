package service;

import java.util.Date;
import java.util.List;
import com.google.api.server.spi.config.Api;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.repackaged.com.google.datastore.v1.CompositeFilter;
import com.google.appengine.api.datastore.Entity;

@Api(name = "roomapi")
public class RoomEndPoint {
	public DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	
	public List<Entity> getRooms () {
		Query q = new Query("Room");
		List<Entity> rooms = datastore.prepare(q).asList(FetchOptions.Builder.withDefaults());
		for (Entity room : rooms) {
		    // Effectuer des actions sur l'entité result
			// Faire une liste du nom des salles à afficher
		}
		
		return rooms;
	}
	
	public List<Entity> getCreneauxLibres (Date start, Date end) {
		Filter StartDateTimeFilter = new Query.FilterPredicate("start", FilterOperator.GREATER_THAN_OR_EQUAL, start);
	    Filter EndDateTimeFilter = new Query.FilterPredicate("end", FilterOperator.LESS_THAN_OR_EQUAL, end);

    	// Use CompositeFilter to combine multiple filters
    	Query.CompositeFilter DateRangeFilter = Query.CompositeFilterOperator.and(StartDateTimeFilter, EndDateTimeFilter);
		
		Query q = new Query("Creneau").setFilter(DateRangeFilter);
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> creneaux = pq.asList(FetchOptions.Builder.withDefaults());
		
		return creneaux;
	}
}
