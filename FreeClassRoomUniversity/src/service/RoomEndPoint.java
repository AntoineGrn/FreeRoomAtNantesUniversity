package service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.config.Nullable;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.search.DateUtil;
import com.google.appengine.api.users.*;

@Api(name = "monapi", version="v1")
public class RoomEndPoint {
	public DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	final long hoursInMillis = 60L * 60L * 1000L;
	
	@ApiMethod(
	        path = "rooms/get",
	        httpMethod = HttpMethod.GET
	    )
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
	        path = "creneaux/get/{userId}/{start}/{end}",
	        httpMethod = HttpMethod.GET
	    )
	public List<Entity> getCreneaux (@Named("userId") String userId, @Named("start") String start, @Named("end") String end) throws ParseException {
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
	        path = "creneaux/post/setCreneau",
	        httpMethod = HttpMethod.POST
	    )
	public void setCreneau(@Named("userId") String userId, @Named("start") String start, @Named("end") String end, @Named("salle") String salle, @Named("mail") @Nullable String mail, @Named("nbPersonne") String nbPersonne, @Named("desc") @Nullable String desc) throws ParseException {
		final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
		final Date startDate = sdf.parse(start);
		final Date endDate = sdf.parse(end);
		Entity resa = new Entity("Reservation");
		resa.setProperty("start", startDate.getTime());
		resa.setProperty("end", endDate.getTime());
		resa.setProperty("salle", salle);
		resa.setProperty("mail", mail);
		resa.setProperty("nbPersonne", nbPersonne);
		resa.setProperty("description", desc);
		resa.setProperty("userID", userId);
		datastore.put(resa);
	}
	
	@ApiMethod(
	        path = "creneaux/get/{userId}/{salle}",
	        httpMethod = HttpMethod.GET
	    )
	public List<Entity> getCreneauxSalle(@Named("userId") String userId, @Named("salle") String salle) throws ParseException {
		Filter roomFilter = new Query.FilterPredicate("salle", FilterOperator.EQUAL, salle);
		Query q = new Query("Creneau").setFilter(roomFilter);
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> creneaux = pq.asList(FetchOptions.Builder.withDefaults());
		System.out.println(creneaux);
		for (Entity creneau : creneaux) {
			Date startEvent = new Date((long) creneau.getProperty("start")+ (2L * hoursInMillis));
			creneau.setProperty("start", startEvent);
			
			Date endEvent = new Date((long) creneau.getProperty("end")+ (2L * hoursInMillis));
			creneau.setProperty("end", endEvent);
		}
		System.out.println(creneaux);		
		return creneaux;
	}
	
	@ApiMethod(
	        path = "reservations/get/{userId}",
	        httpMethod = HttpMethod.GET
	    )
	public List<Entity> getReservationByUser(@Named("userId") String userId) throws ParseException {
		Filter resaFilter = new Query.FilterPredicate("userID", FilterOperator.EQUAL, userId);
		Query q = new Query("Reservation").setFilter(resaFilter);
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> reservations = pq.asList(FetchOptions.Builder.withDefaults());
		System.out.println(reservations);
		for (Entity reservation : reservations) {
			Date startEvent = new Date((long) reservation.getProperty("start")+ (2L * hoursInMillis));
			reservation.setProperty("start", startEvent);
			
			Date endEvent = new Date((long) reservation.getProperty("end")+ (2L * hoursInMillis));
			reservation.setProperty("end", endEvent);
		}
		System.out.println(reservations);		
		return reservations;
	}
	
	@ApiMethod(
	        path = "reservations/get/{userId}/{salle}",
	        httpMethod = HttpMethod.GET
	    )
	public List<Entity> getReservationBySalle(@Named("userId") String userId, @Named("salle") String salle) throws ParseException {
		Filter resaFilter = new Query.FilterPredicate("salle", FilterOperator.EQUAL, salle);
		Query q = new Query("Reservation").setFilter(resaFilter);
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> reservations = pq.asList(FetchOptions.Builder.withDefaults());
		System.out.println(reservations);
		for (Entity reservation : reservations) {
			Date startEvent = new Date((long) reservation.getProperty("start")+ (2L * hoursInMillis));
			reservation.setProperty("start", startEvent);
			
			Date endEvent = new Date((long) reservation.getProperty("end")+ (2L * hoursInMillis));
			reservation.setProperty("end", endEvent);
		}
		System.out.println(reservations);		
		return reservations;
	}
}
