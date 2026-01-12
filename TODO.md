<Route path="/papers" component={Papers} /> - route done - page done
<Route path="/papers/filter" component={PapersFilter} />
<Route path="/paper/:id" component={PaperDetails} /> - 
<Route path="/chemicals" component={ChemicalsHome} /> - route done
<Route path="/chemicals/filter" component={ChemicalFilter} />
<Route path="/chemical/:id" component={ChemicalDetail} />
<Route path="/formulation/:id" component={FormulationDetailPage} /> - route done - page done
<Route path="/advanced-search" component={AdvancedSearchPage} />

route | page | performance review (pagination, client side render etc...) | zod and validation | review