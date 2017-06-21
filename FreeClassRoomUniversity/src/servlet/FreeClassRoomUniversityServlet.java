package servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.TimeZone;
import javax.servlet.http.*;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;

@SuppressWarnings("serial")
public class FreeClassRoomUniversityServlet extends HttpServlet {
	public DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	String urlSalle = "https://edt.univ-nantes.fr/sciences/";
	String urlListe = "https://edt.univ-nantes.fr/sciences/rindex.html";
	ArrayList<String> rooms = new ArrayList<String>();
	ArrayList<String> names = new ArrayList<String>();
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		try {
			deleteDataStore();
			initRoomsListAndNamesList();
			for (String room : rooms) {
				String urlRoom = urlSalle + room.replace(".html", ".ics");
				URL url = new URL(urlRoom);
				URLConnection uc = url.openConnection();
				uc.setRequestProperty ("Authorization", "Basic ZTEzNDg4N3I6I0BBbnRvaW5lMyM=");
				InputStream inp = uc.getInputStream();
				BufferedReader reader = new BufferedReader(new InputStreamReader(inp,"UTF-8"));
				
				String line = reader.readLine();
				final long hoursInMillis = 60L * 60L * 1000L;
				final SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'");
				Date today = new Date();
				Date start = null, end = null;
				while (!line.contains("END:VCALENDAR")){
					if (line.contains("BEGIN:VEVENT")) {
						while (!line.contains("END:VEVENT")) {
							if (line.contains("DTSTART")){
								String dateCalUTC = line.split(":")[1];
								final java.util.Date dateCal = sdf.parse(dateCalUTC);
								Date dateObj = new Date(dateCal.getTime() + (2L * hoursInMillis));
								sdf.setTimeZone(TimeZone.getTimeZone("Europe/Paris"));   // This line converts the given date into UTC time zone
								//String aRevisedDate = new SimpleDateFormat("dd/MM/yyyy kk:mm:ss").format(dateObj);	
								start = dateObj;
							}

							if (line.contains("DTEND")){
								String dateCalUTC = line.split(":")[1];
								final java.util.Date dateCal = sdf.parse(dateCalUTC);
								Date dateObj = new Date(dateCal.getTime() + (2L * hoursInMillis));
								sdf.setTimeZone(TimeZone.getTimeZone("Europe/Paris"));   // This line converts the given date into UTC time zone	
								end = dateObj;
							}
							
							if (start != null && end != null) {
								if (start.after(today)) {
									Entity creneau = new Entity("Creneau");
									creneau.setProperty("start", start.getTime());
									creneau.setProperty("end", end.getTime());
									creneau.setProperty("salle", room.replace(".html", ""));
						    		datastore.put(creneau);
									System.out.println("Salle : " + room + " Heure de début : "+ start.getTime() + " Heure de fin" + end.getTime());
									start = null;
									end = null;
								}
							}
						line = reader.readLine();
						}
					}
					line = reader.readLine();
					}
				}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void initRoomsListAndNamesList() throws Exception{
		URL url = new URL(urlListe);
		URLConnection uc = url.openConnection();
		uc.setRequestProperty ("Authorization", "Basic ZTEzNDg4N3I6I0BBbnRvaW5lMyM=");
		InputStream inp = uc.getInputStream();
		BufferedReader reader = new BufferedReader(new InputStreamReader(inp,"UTF-8"));
		
		String line = reader.readLine();
		
	    while (!line.contains("/select")){
	    	if(line.contains("option value")){
	    		String[] valueHtml = line.split("\"");
	    		String name = valueHtml[1].split("\"")[0];
	    		
	    		String[] nomSalle = line.split(">");
	    		String salle = nomSalle[1].split("<")[0];
	    		
	    		rooms.add(name);
	    		names.add(salle);
	    		
	    		Entity room = new Entity("Room");
	    		room.setProperty("name", name);
	    		room.setProperty("salle", salle);
	    		datastore.put(room);
	    	}
	    	line = reader.readLine();
	    }
	}
	
	private void deleteDataStore(){
		Query deleteCreneaux = new Query("Creneau");
    	PreparedQuery pq = datastore.prepare(deleteCreneaux);
    	for (Entity result : pq.asIterable()) {
    		datastore.delete(result.getKey()); 
    	}
    	Query deleteSalle = new Query("Room");
    	PreparedQuery pqSalle = datastore.prepare(deleteSalle);
    	for (Entity result : pqSalle.asIterable()) {
    		datastore.delete(result.getKey()); 
    	}
	}
}
