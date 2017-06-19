package service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.Named;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query.FilterPredicate;

@Api(name = "monapi", version="v1")
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
	@ApiMethod(
	        path = "creneaux/get/{start}/{end}",
	        httpMethod = HttpMethod.GET
	    )
	public List<Entity> getCreneaux (@Named("start") String start, @Named("end") String end) throws ParseException {
		final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
		final Date startDate = sdf.parse(start);
		final Date endDate = sdf.parse(end);
		long startDateTime = startDate.getTime();
		long endDateTime = endDate.getTime();
		Filter StartDateTimeFilter = new Query.FilterPredicate("start", FilterOperator.GREATER_THAN_OR_EQUAL, startDateTime);
	    Filter EndDateTimeFilter = new Query.FilterPredicate("start", FilterOperator.LESS_THAN_OR_EQUAL, endDateTime);

    	// Use CompositeFilter to combine multiple filters
    	Query.CompositeFilter DateRangeFilter = Query.CompositeFilterOperator.and(StartDateTimeFilter, EndDateTimeFilter);
		
		Query q = new Query("Creneau").setFilter(DateRangeFilter);
		System.out.println(q);
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> creneaux = pq.asList(FetchOptions.Builder.withDefaults());
		
		return creneaux;
	}
	
	@ApiMethod(
	        path = "creneaux/get/{start}/{end}/{salle}",
	        httpMethod = HttpMethod.POST
	    )
	public void setCreneau(@Named("start") String start, @Named("end") String end, @Named("salle") String salle) throws ParseException {
		final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
		final Date startDate = sdf.parse(start);
		final Date endDate = sdf.parse(end);
		Entity creneau = new Entity("Creneau");
		creneau.setProperty("start", startDate.getTime());
		creneau.setProperty("end", endDate.getTime());
		creneau.setProperty("salle", salle);
		datastore.put(creneau);
	}
	
	@ApiMethod(
	        path = "creneaux/get/{salle}",
	        httpMethod = HttpMethod.GET
	    )
	public List<Entity> getCreneauxSalle(@Named("salle") String salle) throws ParseException {
		Filter roomFilter = new Query.FilterPredicate("salle", FilterOperator.GREATER_THAN_OR_EQUAL, salle);
		Query q = new Query("Creneau").setFilter(roomFilter);
		System.out.println(q);
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> creneaux = pq.asList(FetchOptions.Builder.withDefaults());
		
		return creneaux;
	}
}
