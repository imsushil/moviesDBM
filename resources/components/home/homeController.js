angular.module("movies").controller("HomeController", ['HomeService', '$q', '$timeout', '$scope', HomeController]);

function HomeController(HomeService, $q, $timeout, $scope) {
	var homeVm = this;
	homeVm.moviesList = [];
    homeVm.pageSize = 20;
    homeVm.startFrom = 1;
    homeVm.totalPages = null;
    homeVm.currentPage = 1;
    homeVm.languages = [];
    homeVm.countries = [];
    homeVm.ctry = "";
    homeVm.lang = "";
    homeVm.rev = false;
    homeVm.mobileFilters = false;
    
    /* Calling API of HomeService to get movie list */
	HomeService.getMoviesList()
				.then(function(data){
                    homeVm.moviesList = data;
                    var i, movieId, len = homeVm.moviesList.length;
                    var langSet = new Set();
                    var ctrySet = new Set();
                    for(i = 0; i < len; ++i) {
                        homeVm.moviesList[i].genresList = homeVm.moviesList[i].genres.split('|');
                        if(homeVm.moviesList[i].language !== "") {
                            langSet.add(homeVm.moviesList[i].language);
                        } else{
                            homeVm.moviesList[i].language = "NA";
                        }
                        if(homeVm.moviesList[i].country !== "") {
                            ctrySet.add(homeVm.moviesList[i].country);
                        } else {
                            homeVm.moviesList[i].country = "NA";
                        }
                        if(homeVm.moviesList[i].title_year === "") {
                            homeVm.moviesList[i].title_year = "NA";
                        }
                    }
                    homeVm.languages = Array.from(langSet);
                    
                    homeVm.countries = Array.from(ctrySet);
                    
                    homeVm.setTotalPages(len);
                    homeVm.getPosters(homeVm.moviesList, 0);
                    homeVm.initializeDropdowns();
				}, function(response){
                    console.log("Location=HomeController, msg=Some error occurred while fetching movie data");
                    console.log(response);
                }).catch(function(e){
                    console.error("Some exception occurred in success method", e);
                });
    
    /* Calling API of HomeService to get movie posters */
    homeVm.getPosters = function(list, start) {
        console.log("list=", list);
        console.log("start=", start);
        var promises=[], i;
        var end;
        if((start + homeVm.pageSize) < list.length){
            end = (start + homeVm.pageSize);
        }else {
            end = list.length;
        }
        
        for(i = start; i < end; ++i) {
            movieId = list[i].movie_imdb_link.split("/")[4];
            if(!list[i].hasOwnProperty("image") && movieId !== "") {
                promises.push(HomeService.getMoviePosters(movieId));   
            }
        }
        
        $q.all(promises).then(function(data) {
            for(i = 0; i < data.length; ++i) {
                if(!list[start+i].hasOwnProperty("image")){
                    list[start+i].image = data[i].Poster;    
                }
                if(!list[start+i].hasOwnProperty("plot"))
                    list[start+i].plot = data[i].Plot;
            }
        });
    }
    
    homeVm.call = function() {
        homeVm.currentPage = 1;
        homeVm.update();
    }

    homeVm.initializeDropdowns = function() {
        angular.element('#language').dropdown({
            clearable: true
        });
        angular.element('#country').dropdown({
            clearable: true
        });
    }
    // homeVm.initializeDropdowns();

    homeVm.clearFilters = function() {
        setTimeout(() => {
            angular.element('#country').dropdown("clear");
            angular.element('#language').dropdown("clear");
            console.log("clearing dropdowns");
        }, 0);

        // resetting sort by
        homeVm.prop = "";
        homeVm.rev = false;
        homeVm.currentPage = 1;
        x = document.querySelectorAll(".sortBy");
        for (i = 0; i < x.length; i++) {
            x[i].checked = false;
        }
    }
    
    homeVm.setTotalPages = function(len) {
        homeVm.totalPages = Math.ceil(len/homeVm.pageSize);
    }
    homeVm.getTotalPages = function() {
        return Math.ceil(homeVm.filteredList.length/homeVm.pageSize);
    }
    
    /* Functions for pagination */
    homeVm.next = function() {
        if(homeVm.currentPage < homeVm.getTotalPages()){
            homeVm.currentPage += 1;
            homeVm.update();
        }
    }
    homeVm.prev = function(){
        if(homeVm.currentPage > 1){
            homeVm.currentPage -= 1;
            homeVm.update();
        }
    }
    homeVm.first = function(){
        homeVm.currentPage=1;
        homeVm.update();
    }
    homeVm.last = function(){
        homeVm.currentPage = homeVm.getTotalPages();
        homeVm.update();
    }

    
    /* Filters */
    /* homeVm.setLanguage = function() {
        homeVm.lang = angular.element("#language").dropdown("get text");
        homeVm.currentPage=1;
        homeVm.update();
    }
    
    homeVm.setCountry = function() {
        homeVm.ctry = angular.element("#country").dropdown("get text");
        homeVm.currentPage=1;
        homeVm.update();
    } */

    // Fetches posters of the filteredList array and sets total pages of pagination
    homeVm.update = function() {
        setTimeout(function() {
            homeVm.getPosters(homeVm.filteredList, (homeVm.currentPage-1)*homeVm.pageSize); // fetch posters
            homeVm.setTotalPages(homeVm.filteredList.length); // update total pages
        }, 100);
    }

    // Filters
    homeVm.sort = function(property, rev) {
        homeVm.prop = property;
        homeVm.rev = rev;
        homeVm.update();
    }
}